import React from 'react';
import './Form.css';


class Login extends React.Component {
    render() {
        return (

            <div className="login-form">

                <div className="main-div">
                    <div >
                        <h2>Вхід</h2>
                    </div>

                    <form id="Login" >

                        <div className="form-group">
                            <input type="email" className="form-control" id="inputEmail" placeholder="Логін" />
                        </div>

                        <div className="form-group">
                            <input type="password" className="form-control" id="inputPassword" placeholder="Пароль" />
                        </div>

                        <button type="submit" className="btn btn-primary">Вхід</button>

                        <label className="remember">
                            <span>Запам'ятати</span> <span><input id="remember-me" name="remember-me" type="checkbox" /></span>
                        </label>

                        <div id="register-link" className="text-right">
                            <a href="#" className="text-info" >Забули пароль?</a>
                        </div>

                    </form>

                </div>
            </div>
        )
    }
}
export default Login;