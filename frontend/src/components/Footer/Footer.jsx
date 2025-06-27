import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <div className='footer' id='footer' >
        <div className="footer-content">
            <div className="footer-content-left">
                <img src={assets.logo} alt="image of logo" className="footer-logo" />
                <p>For over a decade, delivering and feeding our customers fresh meals of harmonious and tasteful happiness</p>
                <div className="footer-social-icons">
                    <img src={assets.facebook_icon} alt="facebook icon" />
                    <img src={assets.twitter_icon} alt="twitter icon" />
                    <img src={assets.linkedin_icon} alt="linkedin icon" />
                </div>
            </div>
            <div className="footer-content-center">
                <h2>COMPANY</h2>
                <ul>
                    <li>Home</li>
                    <li>About us</li>
                    <li>Delivery</li>
                    <li>Privacy policy</li>
                </ul>
            </div>
            <div className="footer-content-right">
                <h2>GET IN TOUCH</h2>
                <ul>
                    <li>+1-123-456-789</li>
                    <li>contact@bitebox.com</li>
                </ul>
            </div>
        </div>
        <hr />
        <p className="footer-copyright">Copyright {new Date().getFullYear()} © BiteBox.com - All Right Reserved</p>
    </div>
  )
}

export default Footer
