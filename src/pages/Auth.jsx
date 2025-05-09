import React, { useState, useEffect } from 'react';
import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth, provider, storage } from '../Configration/firebaseAuth';
import { FcGoogle } from 'react-icons/fc';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const Auth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const authInfo = {
        userID: user.uid,
        name: user.displayName,
        profilephoto: user.photoURL,
        email: user.email,
        isAuth: true,
      };
      localStorage.setItem("auth", JSON.stringify(authInfo));
      alert(`Welcome ${user.displayName}`);
      navigate('/dashboard');
    } catch (error) {
      console.error("Google Login Error", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let userCredential;

      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);

        let photoURL = "";

        if (image) {
          const storageRef = ref(storage, `users/${userCredential.user.uid}/profile.jpg`);
          await uploadBytes(storageRef, image);
          photoURL = await getDownloadURL(storageRef);
        }

        await updateProfile(userCredential.user, {
          photoURL,
          displayName: email.split("@")[0],
        });
      }

      const user = userCredential.user;
      const authInfo = {
        userID: user.uid,
        name: user.displayName || 'Anonymous',
        profilephoto: user.photoURL || '',
        email: user.email,
        isAuth: true,
      };
      localStorage.setItem("auth", JSON.stringify(authInfo));
      alert(`Welcome ${user.email}`);
      navigate('/dashboard');
    } catch (error) {
      console.error("Email Auth Error", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-200 via-red-200 to-yellow-100 p-4">
      <div className="bg-white shadow-2xl rounded-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Expense Tracker</h1>
          <p className="text-gray-600 mt-2">Track your expenses with ease</p>
        </div>

        <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">
          {isLogin ? 'Welcome Back!' : 'Create Account'}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full bg-white border px-4 py-3 rounded shadow hover:shadow-md transition mb-4"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
          ) : (
            <>
              <FcGoogle className="text-xl" />
              Sign in with Google
            </>
          )}
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
          </div>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleEmailAuth}>
          {!isLogin && (
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="border rounded px-4 py-2"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="ml-1 text-blue-500 hover:underline"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
