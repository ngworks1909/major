import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRecoilValue } from 'recoil';
import { TokenState } from '../states/TokenState';
import "./Adddoc.css";
import Chatbot from './Chatbot';
import Navbar from './Navbar';



export default function Complain() {
  const [docs, setDocs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [progress, setProgress] = useState(true);
  const authToken = useRecoilValue(TokenState);
  const navigate = useNavigate();


  const notifysuccess = (message) => {
    toast.success(message, {
      autoClose: 2000,
      onClose: () => {
        navigate('/docs');
      }
    });
  }
  const notifyfailure = (error) => toast.success(error);



  const dateconvert = (timestamp) => {
    const datenew = new Date(
      timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
    );
    const dateString = datenew.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "Asia/Kolkata",
    });
    return dateString;
  };

  useEffect(()=> {
    fetch(`http://localhost:3001/api/operation/fetchFiles`, {
              method: "GET",
              headers: {
                  "Content-Type": "application/json",
                  "auth-token": authToken
                },
      }).then(async(response) => {
        const json = await response.json()
        if(json.success){
          const {files} = json;
          setDocs(files);
        }
        else{
          notifyfailure(json.error);
        }
        setProgress(false);
    });

    // eslint-disable-next-line
  },[]);

  const fetchFile = async(id) => {
    setProgress(true);
    const response = await fetch(`http://localhost:3001/api/operation/fetchMissing/${id}`, {
              method: "PUT",
              headers: {
                  "Content-Type": "application/json",
                  "auth-token": authToken
              },
    })
    const json = await response.json();
    if(json.success){
      setProgress(false);
      notifysuccess(json.message);
    }
    else{
      setProgress(false);
      notifyfailure(json.error);
    }

  }
  

  const filteredDocs = docs.filter((doc) =>
    doc.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <>
      <Navbar />
      {progress ? (
        <div className="sp">
          <div className="spinner-border " role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>) : (
        <div className="docs">
          <div className="table-res">
            <div className="searchh">
              <form className="navsearch me-auto">
                <svg
                  className="ssvg"
                  width="17"
                  height="17"
                  viewBox="0 0 17 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.2083 10.8333H11.4842L11.2275 10.5858C12.1258 9.54083 12.6667 8.18417 12.6667 6.70833C12.6667 3.4175 9.99917 0.75 6.70833 0.75C3.4175 0.75 0.75 3.4175 0.75 6.70833C0.75 9.99917 3.4175 12.6667 6.70833 12.6667C8.18417 12.6667 9.54083 12.1258 10.5858 11.2275L10.8333 11.4842V12.2083L15.4167 16.7825L16.7825 15.4167L12.2083 10.8333ZM6.70833 10.8333C4.42583 10.8333 2.58333 8.99083 2.58333 6.70833C2.58333 4.42583 4.42583 2.58333 6.70833 2.58333C8.99083 2.58333 10.8333 4.42583 10.8333 6.70833C10.8333 8.99083 8.99083 10.8333 6.70833 10.8333Z"
                    fill="#7A7A7A"
                  />
                </svg>
                <input type="text" name="" id="" className="navs" placeholder="Enter Name of Doc" value={searchTerm} onChange={(event) => {
                  event.preventDefault();
                  setSearchTerm(event.target.value);
                }} required />
              </form>
            </div>
            <table className="tbl">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Name</th>
                  <th>Created At</th>
                  <th style={{width: '110px'}}>Fetch</th>
                  {/* <th>Delete</th> */}
                </tr>
              </thead>
              <tbody>
                {filteredDocs.length > 0 ? filteredDocs.map((doc, index) => (
                  <tr key={`complain${doc.fileId}`}>
                    <td>{index + 1}</td>
                    <td autoCapitalize='false'>{doc.filename}</td>
                    <td>{dateconvert(doc.createdAt)}</td>
                    <td style={{width: '110px'}}><input type='button' className="clickb" onClick={async(e) => {
                        e.preventDefault();
                        await fetchFile(doc.fileId);
                    }} value={'Fetch file'}/></td>
                    {/* <td className="bin"> <MdDelete className='delete-icon' onClick={() => handleDelete(doc.fileId)} /> </td> */}
                  </tr>
                )) : (
                  <p className="pp">No docs to display. To add a doc <Link to='/addoc' className="linkto">click Here</Link></p>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Chatbot />
      <ToastContainer />
      
    </>
  )
}
