import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ADMIN_TOKEN_KEY = "k3AdminToken";

const AdminLogin = () => {
    const [formData, setFormData] = useState({
        login: "",
        password: ""
    });


    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        localStorage.removeItem(ADMIN_TOKEN_KEY);

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! Status: ${response.status}`);
            }

            if (!data.token) {
                throw new Error("Сервер не вернул токен авторизации");
            }

            localStorage.setItem(ADMIN_TOKEN_KEY, data.token);

            navigate('/admin/panel');

        } catch (error) {
            console.error(error);
            alert(`Error: ${error.message}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-64 mx-auto mt-10">
            <div>
                <label htmlFor="login">Логин:</label>
                <input
                    type="text"
                    id="login"
                    name="login"
                    value={formData.login}
                    onChange={handleChange}
                    required
                    className="border"
                />
            </div>
            <div>
                <label htmlFor="password">Пароль:</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="border"
                />
            </div>
            <button type="submit" className="border p-2 bg-blue-500 text-white">
                Войти
            </button>
        </form>
    );
};

export default AdminLogin;
