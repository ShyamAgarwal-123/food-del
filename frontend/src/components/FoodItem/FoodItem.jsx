import React from 'react'
import './FoodItem.css'
import { assets } from '../../assets/assets'
//import { useState } from 'react'
import { useContext } from 'react'
import { StoreContext } from '../../context/StoreContext'

const FoodItem = ({id,name,price,description,image}) => {

    const {cartItems,addToCart,removeFromCart,url} = useContext(StoreContext);

  return (
    <div className='food-item'>
        <div className="food-item-img-container">
            <img src={url+"/images/"+ image} alt="image of individual food item" className="food-item-image" />
            {!cartItems[id]? 
            <img onClick={()=>addToCart(id)} src={assets.add_icon_white} alt="adding item of food to one" className="add" />:
            <div className="food-item-counter">
                <img onClick={()=>removeFromCart(id)} src={assets.remove_icon_red} alt="reduing the number of items" />
                <p>{cartItems[id]}</p>
                <img onClick={()=>addToCart(id)} src={assets.add_icon_green} alt="adding item of food" />
            </div>
        } 
        </div>
        <div className="food-item-info">
            <div className="food-item-name-rating">
                <p>{name}</p>
                <img src={assets.rating_starts} alt="rating of each food item" />
            </div>
            <p className='food-item-desc'>{description}</p>
            <p className='food-item-price'>$ {price}</p>
        </div>      
    </div>
  )
}

export default FoodItem
