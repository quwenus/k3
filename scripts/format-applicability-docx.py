#!/usr/bin/env python3
import argparse
import re
import sys
from collections import OrderedDict
from pathlib import Path
from xml.etree import ElementTree as ET
from zipfile import BadZipFile, ZipFile


WORD_NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
SKU_PATTERN = re.compile(r"^[A-ZА-Я]{1,4}\d+[A-ZА-Я0-9-]*$", re.IGNORECASE)


def read_docx_paragraphs(docx_path):
    try:
        with ZipFile(docx_path) as archive:
            document_xml = archive.read("word/document.xml")
    except (BadZipFile, KeyError) as error:
        raise ValueError(f"Не удалось прочитать DOCX: {docx_path}") from error

    root = ET.fromstring(document_xml)
    paragraphs = []

    for paragraph in root.findall(".//w:p", WORD_NS):
        pieces = []

        for node in paragraph.iter():
            tag_name = node.tag.rsplit("}", 1)[-1]

            if tag_name == "t" and node.text:
                pieces.append(node.text)
            elif tag_name == "tab":
                pieces.append("\t")
            elif tag_name in {"br", "cr"}:
                pieces.append("\n")

        text = "".join(pieces).strip()

        if text:
            paragraphs.extend(line.strip() for line in text.splitlines() if line.strip())

    return paragraphs


def strip_existing_markers(value):
    return (
        value.strip()
        .replace("[big]", "")
        .replace("[/big]", "")
        .replace("[small]", "")
        .replace("[/small]", "")
        .replace("**", "")
        .lstrip("# ")
        .strip()
    )


def should_skip_title(line, docx_path, keep_title):
    if keep_title:
        return False

    clean_line = strip_existing_markers(line)
    file_stem = docx_path.stem.strip()

    return clean_line.lower() == file_stem.lower() or bool(SKU_PATTERN.match(clean_line))


def parse_brand_model(line):
    if "," not in line:
        return None, strip_existing_markers(line)

    brand, model = line.split(",", 1)
    brand = strip_existing_markers(brand)
    model = model.strip()

    if not brand or not model:
        return None, strip_existing_markers(line)

    return brand, model


def format_applicability(lines, docx_path, keep_title=False, blank_lines=False):
    groups = OrderedDict()
    loose_lines = []

    for line in lines:
        if should_skip_title(line, docx_path, keep_title):
            continue

        brand, model = parse_brand_model(line)

        if brand is None:
            loose_lines.append(model)
            continue

        groups.setdefault(brand, []).append(model)

    output_lines = []

    for brand, models in groups.items():
        if blank_lines and output_lines:
            output_lines.append("")

        output_lines.append(f"**{brand}**")
        output_lines.extend(models)

    if loose_lines:
        if blank_lines and output_lines:
            output_lines.append("")

        output_lines.extend(loose_lines)

    return "\n".join(output_lines).strip() + "\n"


def main():
    parser = argparse.ArgumentParser(
        description="Конвертирует применяемость из DOCX в текст с жирными брендами для сайта."
    )
    parser.add_argument("docx", type=Path, help="Путь к .docx файлу")
    parser.add_argument("-o", "--out", type=Path, help="Куда сохранить результат. Если не указано, печатает в stdout.")
    parser.add_argument("--keep-title", action="store_true", help="Не пропускать первую строку с артикулом/названием файла.")
    parser.add_argument("--blank-lines", action="store_true", help="Добавлять пустую строку между брендами.")
    args = parser.parse_args()

    try:
        lines = read_docx_paragraphs(args.docx)
        formatted_text = format_applicability(
            lines,
            args.docx,
            keep_title=args.keep_title,
            blank_lines=args.blank_lines,
        )
    except ValueError as error:
        print(error, file=sys.stderr)
        return 1

    if args.out:
        args.out.write_text(formatted_text, encoding="utf-8")
    else:
        print(formatted_text, end="")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
