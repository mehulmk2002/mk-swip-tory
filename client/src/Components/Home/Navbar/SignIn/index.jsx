import React, { useState } from "react";
import "./style.css";
import useStoryContext from "../../../../hooks/useProductContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Index() {
  let naviagte = useNavigate();
  
const [usenameValue,setUsernameValue]=useState();
const [passwordValue,setPasswordValue]=useState();
const [errorMassage,setErrorMassage]=useState('')
  const { setSignPop, 
    signRef, 
    homeRef, 
    navbarRef, 
    footerRef, 
    bannerRef,
    setName
  } =useStoryContext();

  let onClickClose = () => {
    homeRef.current.style.backgroundColor = "white";
    bannerRef.current.style.zIndex = 1;
    footerRef.current.style.zIndex = 1;
    navbarRef.current.style.zIndex = 1;
    setSignPop(false);
    naviagte(0);
    
  };
 

  const handleSubmit = (event) => {
    event.preventDefault();
    const userData = {
      user: usenameValue,
      password: passwordValue,
    };
      
    axios.post(`${process.env.REACT_APP_HOST}/login`, userData)
      .then((response) => {
       if(response.data.status=='SUCCESS'){
        console.log(response.data);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("name",usenameValue);
        setErrorMassage(response.data.message)
        naviagte("/");
        
       }
       else{
        console.log(response.data);
        console.log(response.data.message);
        setErrorMassage(response.data.message)
       }
        
    
        setTimeout(() => {
          
          naviagte("/");
        }, 2000);
      })
      .catch((error) => {
        
        console.error(error);
      });
  };
  return (
    <div className="overlay-sign-in-pop" ref={signRef}>
      <h1 className="heading-sign-in">Login to SwipTory</h1>
      <div className="error-msg">{errorMassage}</div>
      <form>
        <table>
          <tbody>
            <tr>
              <td>
                <h1 className="username-heading">Username</h1>
              </td>
              <td>
                <input
                  type="text"
                  name="user"
                  className="user"
                  placeholder="Enter username"
                  value={usenameValue}
                onChange={(e)=>{setUsernameValue(e.target.value)}}
                  required
                />
              </td>
            </tr>
            <tr>
              <td>
                <h1 className="password-heading">Password</h1>
              </td>
              <td>
                <div className="wrapper-password">
                  <input
                    type="password"
                    name="password"
                    className="password"
                    placeholder="Enter password"
                    value={passwordValue}
                onChange={(e)=>{setPasswordValue(e.target.value)}}
                    required
                  />
                  <img src="eye.png" alt="" className="eye-img" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div className="wrapper-login-btn">
          <button onClick={handleSubmit} className="register-btn">Login</button>
        </div>
      </form>
      <img
        src="close.png"
        alt=""
        className="close-icon"
        onClick={() => onClickClose()}
      />
    </div>
  );
}
