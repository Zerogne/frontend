import './side.css'
import "@fontsource/inter/700.css";
import '@fontsource/inter/500.css';
import '@fontsource/inter/300.css';
import { useNavigate, NavLink } from 'react-router-dom';
import React from 'react';

const Side = ({ isOpen, onFilterChange }) => {
    const navigate = useNavigate();

    const handleFilterChange = (e) => {
        if (onFilterChange) {
            onFilterChange(e.target.value);
        }
    };

    return (
        <>
            <div className={`seisse ${isOpen ? 'open' : 'closed'}`}>
                <div className='home'>
                    <div id='crazy'>
                        <h3 className='aasd'>Home</h3>
                    </div>

                    <NavLink to="/">
                        {({ isActive }) => (
                            <button
                                className={`hoe ${isActive ? 'my-active-class' : ''}`}
                                id="ho"
                            >
                                <span className="fa-solid--home"></span>
                                <p>Home</p>
                            </button>                        
                        )}
                    </NavLink>
                    <NavLink to="/popular">
                        {({ isActive }) => (
                            <button
                                className={`hoe ${isActive ? 'my-active-class' : ''}`}
                                id="hoo"
                            >
                                <span className="tabler--flame-filled"></span>
                                <p>Popular</p>
                            </button>
                        )}
                    </NavLink>
                    <NavLink to="/topRated">
                        {({ isActive }) => (
                            <button
                                className={`hoe ${isActive ? 'my-active-class' : ''}`}
                                id="hooo"
                            >
                                <span className="solar--medal-ribbon-bold"></span>
                                <p>Top Rated</p>
                            </button>
                        )}
                    </NavLink>
                </div>
                <div className='filter'>
                    <h3 className='aasd'>Filter</h3>    
                    <select 
                        className='aaas' 
                        onChange={handleFilterChange}
                        defaultValue="All Schools"
                    >
                        <option value="All Schools">All Schools</option>
                        <option value="Public">Public</option>
                        <option value="Private">Private</option>
                    </select>
                </div>
                <div className='bt'>
                    <h3 className='aasd'>About</h3> 
                    <p>Share school experiences anonymously or with your name.</p>
                    <div className='po'>
                        <div className='ao'>
                            <span className="fa--group"></span>
                            <p>0</p>
                        </div>
                        <div className='ao'>
                            <span className="si--chat-fill"></span>
                            <p>0</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Side;