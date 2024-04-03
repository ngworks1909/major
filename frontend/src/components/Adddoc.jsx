import React, { useState } from 'react'
import Navbar from '../components/Navbar';
import './Adddoc.css'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Chatbot from './Chatbot';
import {useNavigate} from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { TokenState } from '../states/TokenState';

function Adddoc() {
    const [name, setname] = useState('');
    const [fileContent, setFileContent] = useState(null);
    const [progress, setProgress] = useState(false);
    const navigate = useNavigate();
    const authToken = useRecoilValue(TokenState);

    const notifysuccess = (message) => toast.success(message);
    const notifyfailure = (error) => toast.success(error);

    const handleImageChange = async(e) => {
        e.preventDefault()
        const reader = new FileReader()
        reader.onload = async (e) => { 
          const text = (e.target.result)
          setFileContent(text);
        };
        reader.readAsText(e.target.files[0])
    };

    const handleFormSubmit = async(e) => {
        setProgress(true)
        e.preventDefault();
        const response = await fetch(`http://localhost:3001/api/operation/uploadFile`, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  "auth-token": authToken
                },
               body: JSON.stringify({fileContent, name})
        });
        const json = await response.json();
        if(json.success){
            notifysuccess(json.message);
            navigate('/docs')
        }
        else{
            notifyfailure(json.error);
        }
        setProgress(false);
        
    };

    return (
        <>
            {progress && (
                <>
                    <div className="overlay"></div>
                    <div className="spanner">
                        <div className="loader"></div>
                        <p>Uploading Doc, please be patient.</p>
                    </div>
                </>
            )}
            <div>
                <Navbar />
                <form action="" className='dform' onSubmit={handleFormSubmit}>
                    <div className="form-outline mb-4">
                        <label className="form-label" htmlFor="loginName">Name</label>
                        <input type="text" id="loginName" className="form-control form-control-lg" placeholder='Enter Doc Name' value={name} onChange={(e) => setname(e.target.value)} />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="formFileMultiple" className="form-label">Add a file</label>
                        <input className="form-control form-control-lg" type="file" id="formFileMultiple" onChange={handleImageChange} required />
                    </div>
                    <div className="mb-3 bb">
                        <button type='submit' className="bt">Submit</button>
                    </div>
                </form>
            </div>
            <Chatbot/>
            <ToastContainer/>
        </>
    )
}

export default Adddoc