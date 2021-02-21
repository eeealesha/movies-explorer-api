import './Navigation.css';
import { Link } from "react-router-dom";

function Navigation() {
	return (
		<div className="Navigation">
			<Link className="Navigation_button">Фильмы</Link>
			<Link className="Navigation_button">Сохраненные фильмы</Link>
			<Link className="Navigation_button">Регистрация</Link>
			<Link className="Navigation_button Navigation_button_type_enter">Войти</Link>
		</div>
	);
}

export default Navigation;