import { useState, useEffect } from 'react';
import Field from '../../Contexts/Field';
import DataContext from '../../Contexts/DataContext';
import Create from './Create';
import axios from 'axios';
import Edit from './Edit';
import { authConfig } from '../../Functions/auth';
import { useContext } from 'react';
import Listas from '../field/Listas'; 

function Main() {

    const [lastUpdate, setLastUpdate] = useState(Date.now());
    const [createData, setCreateData] = useState(null);
    const [field, setField] = useState(null)
    const [deleteData, setDeleteData] = useState(null);
    const [modalData, setModalData] = useState(null);
    const [editData, setEditData] = useState(null);
    const { makeMsg } = useContext(DataContext);

    useEffect(() => {
        axios.get('http://localhost:3003/server/field', authConfig())
            .then(res => {
                setField(res.data);
            })
    }, [lastUpdate]);

    useEffect(() => {
        if (null === createData) {
            return;
        }
        axios.post('http://localhost:3003/server/field', createData, authConfig())
            .then(res => {
                setLastUpdate(Date.now());
                makeMsg(res.data.text, res.data.type);
            });
    }, [createData, makeMsg]);

    useEffect(() => {
        if (null === deleteData) {
            return;
        }
        axios.delete('http://localhost:3003/server/field/' + deleteData.id, authConfig())
            .then(res => {
                setLastUpdate(Date.now());
                makeMsg(res.data.text, res.data.type);
            });
    }, [deleteData, makeMsg]);

    useEffect(() => {
        if (null === editData) {
            return;
        }
        axios.put('http://localhost:3003/server/field/' + editData.id, editData, authConfig())
            .then(res => {
                setLastUpdate(Date.now());
                makeMsg(res.data.text, res.data.type);
            });
    }, [editData, makeMsg]);


    return (
        <Field.Provider value={{
            setCreateData,
            setDeleteData,
            modalData,
            setModalData,
            setEditData,
            field
        }}>
            <div className="container">
                <div className="row">
                    <div className="col col-lg-4 col-md-12">
                        <Create />
                    </div>
                    <div className="col col-lg-8 col-md-12">
                        <Listas />
                    </div>
                </div>
            </div>
            <Edit />
        </Field.Provider>
    )
}
export default Main;