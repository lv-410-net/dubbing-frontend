import React, { Component } from 'react';
import './Login.css';
import Logo from '../../assets/images/theater-logo.png';
import Form from './Form/Form';

class MainLogin extends React.Component {

    render() {
        return (

            <div className="MainLogin">
                <img className="logoImg" width="200px" src={Logo} alt="" />
                <Form />
            </div>
        )
    }
}

export default MainLogin;