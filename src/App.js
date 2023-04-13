import React from 'react';
import { useState, useEffect } from 'react';
import './App.css';
import { Button, Form } from 'react-bootstrap';
import logo from './logo.png';
import Loader from './Loader';
import { encode as base64_encode } from 'base-64';
import IPFS from 'ipfs-http-client';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, sendEmailVerification, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import QRCode from 'qrcode.react';
require('dotenv').config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MSG_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

let secrets = process.env.REACT_APP_INFURA_PROJECT_ID + ':' + process.env.REACT_APP_INFURA_PROJECT_SECRET;
let encodedSecrets = base64_encode(secrets);
const ipfs = IPFS.create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    Authorization: 'Basic ' + encodedSecrets,
  },
});

function ProtectedApp({ signOut }) {
  const [buf, setBuf] = useState();
  const [hash, setHash] = useState('');
  const [loader, setLoader] = useState(false);
  const [showLinks, setShowLinks] = useState(false);

  const captureFile = (event) => {
    event.stopPropagation();
    event.preventDefault();
    const file = event.target.files[0];
    let reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => convertToBuffer(reader);
  };

  const convertToBuffer = async (reader) => {
    const buffer = await Buffer.from(reader.result);
    setBuf(buffer);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoader(true);
    let ipfsId;
    const buffer = buf;
    await ipfs.add(buffer)
      .then((response) => {
        ipfsId = response.path;
        console.log('Generated IPFS Hash: ', ipfsId);
        setHash(ipfsId);
      }).catch((err) => {
        console.error(err);
        alert('An error occurred. Please check the console');
      });
    if (ipfsId) {
      setShowLinks(true);
    } else {
      setShowLinks(false);
    }
    setLoader(false);
  };

  if (loader) {
    return (
      <Loader />
    );
  }

  return (
    <div>
      <h1>Upload files to IPFS</h1>
      <h5> Choose file to upload to IPFS </h5>
      <Form onSubmit={onSubmit}>
        <input type="file" onChange={captureFile} required />
        <Button type="submit">Upload</Button>
      </Form>
      {
        showLinks ?
          <div>
            <p>---------------------------------------------------------------------------------------------</p>
            <h6>IPFS Hash: {hash}</h6>
            <p>Non clickable Link: https://cloudflare-ipfs.com/ipfs/{hash}</p>
            <a href={"https://cloudflare-ipfs.com/ipfs/" + hash}>Clickable Link to view file on IPFS</a>
            <div className="mt-4">
            <h5>QR Code:</h5>
              <QRCode value={`https://cloudflare-ipfs.com/ipfs/${hash}`} size={250} />
              </div>
          </div> :
          <p></p>
      }
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
  
    return () => {
      unsubscribe();
    };
  }, []);  

  const signIn = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const allowedDomains = ["gmail.com", "outlook.com"];

  const isAllowedDomain = (email) => {
    const domain = email.split("@")[1];
    return allowedDomains.includes(domain);
  };
  
  const signUp = async (e) => {
    e.preventDefault();
    if (!isAllowedDomain(email)) {
      setErrorMessage("This email domain is not allowed for sign up.");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      setErrorMessage("A verification email has been sent. Please check your inbox.");
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const signOut = async () => {
    await signOut(auth);
  };

  if (user) {
    return <ProtectedApp signOut={signOut} />;
  } else {
    return (
      <div>
      <img src={logo} alt="Logo" className="mx-auto d-block mb-4" />
      {isSigningUp ? <h1>Sign Up</h1> : <h1>Sign In</h1>}
      <div className="container">
        <div className="row">
          <div className="col-md-6 mx-auto">
            <Form onSubmit={isSigningUp ? signUp : signIn}>
              <Form.Group controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Form.Group>
              <Form.Group controlId="password">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </Form.Group>
              <Button type="submit">{isSigningUp ? "Sign Up" : "Sign In"}</Button>
            </Form>
            {errorMessage && <p>{errorMessage}</p>}
            {isSigningUp ? (
              <p>
                Already have an account?{" "}
                <Button variant="link" onClick={() => setIsSigningUp(false)}>Sign In</Button>
              </p>
            ) : (
              <p>
                Don't have an account?{" "}
                <Button variant="link" onClick={() => setIsSigningUp(true)}>Sign Up</Button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  }
}

export default App;




