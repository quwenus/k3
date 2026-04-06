import WarrantyHeading from "../components/WarrantyHeading"
import WarrantyMain from "../components/WarrantyMain"
import WarrantyConditions from "../components/WarrantyConditions"
import WarrantyApplicationInfo from "../components/WarrantyApplicationInfo"

import BorderLine from "../components/BorderLine"

const WarrantyPage = () => {
    return(
        <>
            <WarrantyHeading />
            <BorderLine />
            <WarrantyMain />
            <BorderLine />
            <WarrantyConditions />
            <BorderLine />
            <WarrantyApplicationInfo />
        </>
    )
}


export default WarrantyPage