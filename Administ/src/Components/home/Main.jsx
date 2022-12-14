import Home from "../../Contexts/Home";
import List from "./List";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { authConfig } from '../../Functions/auth';
import { useContext } from "react";
import DataContext from "../../Contexts/DataContext";

function Main() {

        const [lastUpdate, setLastUpdate] = useState(Date.now());
        const [regionai, setRegionai] = useState(null);
        const [field, setField] = useState(null);
        const [comment, setComment] = useState(null);
        const { makeMsg } = useContext(DataContext);

        // READ for list
        useEffect(() => {
            axios.get('http://localhost:3003/home/regionai', authConfig())
                .then(res => {
                    setRegionai((res.data));
                })
        }, [lastUpdate]);

        useEffect(() => {
            axios.get('http://localhost:3003/home/field', authConfig())
                .then(res => {
                    setField((res.data));
                })
        }, [lastUpdate]);

         useEffect(() => {
            if (null === comment) {
                return;
            }
            axios.post('http://localhost:3003/home/comments/' + comment.regionai_id, comment, authConfig())
            .then(res => {
                setLastUpdate(Date.now());
                makeMsg(res.data.text, res.data.type);
            })
         }, [comment, makeMsg]);
   
       

      return (
        <Home.Provider value={{
            setComment,
            regionai,
            setRegionai,
            field,
            setField,
            comment
        }}>
        <div className="container">
            <div className="row">
                <div className="col-12">
                    <List/>
                </div>
            </div>
        </div>
        </Home.Provider>
    );
}

export default Main;