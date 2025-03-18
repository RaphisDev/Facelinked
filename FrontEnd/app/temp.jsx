import React, { useState } from 'react';
import { 
  ChevronRight, 
  User, 
  Users, 
  Heart, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  MapPin, 
  Camera, 
  X, 
  ArrowLeft, 
  ArrowRight, 
  Check,
  Volleyball
} from 'lucide-react';

const AuthPages = () => {
  const [activeTab, setActiveTab] = useState('login');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 shadow-sm py-4 px-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <Users className="h-6 w-6 text-white"/>
          </div>
          <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">Facelinked</span>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Auth Card */}
          <div className="backdrop-blur-sm bg-white/40 rounded-3xl shadow-xl border border-white/50 p-8">
            {/* Tabs */}
            <div className="flex mb-8 border-b border-gray-200">
              <button 
                onClick={() => setActiveTab('login')}
                className={`pb-3 px-4 text-lg font-medium ${activeTab === 'login' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Login
              </button>
              <button 
                onClick={() => setActiveTab('register')}
                className={`pb-3 px-4 text-lg font-medium ${activeTab === 'register' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Register
              </button>
            </div>
            
            {/* Content */}
            {activeTab === 'login' ? 
              <LoginForm /> : 
              <RegistrationFlow />
            }
          </div>
        </div>
      </main>
    </div>
  );
};

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
        Welcome Back
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Mail size={18} className="text-gray-400" />
            </div>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock size={18} className="text-gray-400" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <button 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>
          
          <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
            Forgot password?
          </a>
        </div>
      </div>
      
      <button className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 text-white font-medium hover:from-blue-600 hover:to-blue-800 shadow-md shadow-blue-200 transition duration-300">
        Login
      </button>
      
      <div className="relative mt-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mt-6">
        <button className="py-3 px-4 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition">
          <div className="w-5 h-5 bg-blue-500 rounded-full mr-2"></div>
          Google
        </button>
        <button className="py-3 px-4 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition">
          <div className="w-5 h-5 bg-black rounded-full mr-2"></div>
          Apple
        </button>
      </div>
    </div>
  );
};

const RegistrationFlow = () => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptLegals, setAcceptLegals] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    relationship: null,
    birthDate: { day: 15, month: 'March', year: 2000 },
    location: '',
    interests: '',
    profilePicture: null
  });
  
  const totalSteps = 5;
  
  const updateFormData = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };
  
  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };
  
  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const stepTitles = [
    "Getting Started",
    "Account Details",
    "About You",
    "Profile Details",
    "Profile Picture"
  ];
  
  const renderProgress = () => {
    return (
      <div className="w-full mb-8">
        <div className="flex justify-between mb-4">
          {stepTitles.map((title, index) => (
            <button 
              key={index}
              onClick={() => setStep(index + 1)}
              disabled={index + 1 > step}
              className={`flex flex-col items-center transition-all duration-300 ${index + 1 > step ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300
                ${index + 1 === step ? 'bg-blue-500 text-white scale-110' : 
                index + 1 < step ? 'bg-green-400 text-white' : 'bg-gray-200'}`}
              >
                {index + 1 < step ? <Check size={20} /> : index + 1}
              </div>
              <span className={`text-xs font-medium ${index + 1 === step ? 'text-blue-600' : 'text-gray-500'}`}>
                {title}
              </span>
            </button>
          ))}
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    );
  };
  
  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
              Let's get started
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Choose a Username</label>
                <input
                  type="text"
                  placeholder="Enter username"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={formData.username}
                  onChange={(e) => updateFormData('username', e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
              Your account details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Mail size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                  />
                  <button 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex items-center">
                  <div className="flex-1 h-px bg-gray-300" />
                  <span className="mx-2 text-gray-500 text-sm">Or continue with</span>
                  <div className="flex-1 h-px bg-gray-300" />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button className="py-3 px-4 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition">
                    <div className="w-5 h-5 bg-blue-500 rounded-full mr-2"></div>
                    Google
                  </button>
                  <button className="py-3 px-4 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition">
                    <div className="w-5 h-5 bg-black rounded-full mr-2"></div>
                    Apple
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
              Tell us about yourself
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Are you in a relationship?</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    className={`p-3 border rounded-lg flex justify-center items-center transition-all ${formData.relationship === true ? 'bg-blue-100 border-blue-400' : 'hover:bg-gray-50 border-gray-300'}`}
                    onClick={() => updateFormData('relationship', true)}
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    Yes
                  </button>
                  <button
                    className={`p-3 border rounded-lg flex justify-center items-center transition-all ${formData.relationship === false ? 'bg-blue-100 border-blue-400' : 'hover:bg-gray-50 border-gray-300'}`}
                    onClick={() => updateFormData('relationship', false)}
                  >
                    No
                  </button>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-3">When were you born?</h3>
                <div className="flex gap-2">
                  <select
                    className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={formData.birthDate.day}
                    onChange={(e) => updateFormData('birthDate', {
                      ...formData.birthDate,
                      day: parseInt(e.target.value)
                    })}
                  >
                    {[...Array(31)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                  <select
                    className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={formData.birthDate.month}
                    onChange={(e) => updateFormData('birthDate', {
                      ...formData.birthDate,
                      month: e.target.value
                    })}
                  >
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                  <select
                    className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={formData.birthDate.year}
                    onChange={(e) => updateFormData('birthDate', {
                      ...formData.birthDate,
                      year: parseInt(e.target.value)
                    })}
                  >
                    {[...Array(100)].map((_, i) => (
                      <option key={2025 - i} value={2025 - i}>{2025 - i}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
              Your profile details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Where are you from?</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <MapPin size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="You live in"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={formData.location}
                    onChange={(e) => updateFormData('location', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">What are your hobbies or interests?</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Volleyball size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="football, reading, ..."
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={formData.interests}
                    onChange={(e) => updateFormData('interests', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
              Profile Picture
            </h2>
            <div className="flex flex-col items-center">
              <div
                className="w-40 h-40 bg-gray-100 rounded-full overflow-hidden mb-4 relative cursor-pointer hover:opacity-90 transition-opacity"
              >
                {formData.profilePicture ? (
                  <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex border-dashed border-2 border-gray-300 rounded-full items-center justify-center text-gray-400">
                    <Camera size={48} />
                  </div>
                )}
              </div>
              <span className="text-sm text-gray-500">JPG, PNG or GIF. Max size 5MB.</span>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-300">
              <div className="flex items-center">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptLegals}
                  onChange={() => setAcceptLegals(!acceptLegals)}
                  className="h-4 w-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="terms" className="text-sm ml-2">
                  You are 14 or older and accept the <a href="#" className="text-blue-600 font-medium">Privacy Policy</a> & <a href="#" className="text-blue-600 font-medium">Terms and Conditions</a>
                </label>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div>
      {renderProgress()}
      {renderStepContent()}
      
      <div className="mt-8 flex justify-between">
        {step > 1 ? (
          <button 
            onClick={prevStep}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back
          </button>
        ) : (
          <div></div>
        )}
        
        <button
          onClick={step < totalSteps ? nextStep : () => console.log('Create Account')}
          className={`px-6 py-3 rounded-lg flex items-center text-white font-medium transition-colors ${
            acceptLegals || step < totalSteps ? 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800' : 'bg-gray-400 cursor-not-allowed'
          }`}
          disabled={step === totalSteps && !acceptLegals}
        >
          {step < totalSteps ? (
            <>
              Continue
              <ArrowRight size={16} className="ml-1" />
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </div>
    </div>
  );
};

export default AuthPages;

import React, { useState } from 'react';
import { 
  ChevronRight, 
  User, 
  Users, 
  Heart, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  X, 
  MapPin, 
  Camera
} from 'lucide-react';

const AuthPages = () => {
  const [showLogin, setShowLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // Registration flow state
  const [step, setStep] = useState(1);
  const [acceptLegals, setAcceptLegals] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    relationship: null,
    birthDate: { day: 15, month: 'March', year: 2000 },
    location: '',
    interests: '',
    profilePicture: null
  });

  const totalSteps = 5;

  const updateFormData = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      console.log("Account creation with data:", formData);
      // Here you would handle final submission
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderProgress = () => {
    return (
      <div className="w-full mb-8">
        <div className="flex flex-row justify-between mb-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`w-8 h-8 rounded-full flex items-center justify-center 
                ${index + 1 === step ? 'bg-blue-500 text-white' :
                index + 1 < step ? 'bg-green-400 text-white' : 'bg-gray-200'}`}
            >
              {index + 1 < step ? <Check size={16} /> : <span>{index + 1}</span>}
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 h-2 rounded-full">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Let's get started</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Choose a Username</label>
                <input
                  type="text"
                  placeholder="Enter username"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  value={formData.username}
                  onChange={(e) => updateFormData('username', e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Your account details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Mail size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg"
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex items-center">
                  <div className="flex-1 h-px bg-gray-300" />
                  <span className="mx-2 text-gray-500 text-sm">Or continue with</span>
                  <div className="flex-1 h-px bg-gray-300" />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button className="py-3 px-4 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition">
                    <div className="w-5 h-5 bg-blue-500 rounded-full mr-2"></div>
                    Google
                  </button>
                  <button className="py-3 px-4 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition">
                    <div className="w-5 h-5 bg-black rounded-full mr-2"></div>
                    Apple
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Tell us about yourself</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Are you in a relationship?</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    className={`p-3 border rounded-lg flex justify-center items-center ${formData.relationship ? 'bg-blue-100 border-blue-400' : 'hover:bg-gray-50 border-gray-300'}`}
                    onClick={() => updateFormData('relationship', true)}
                  >
                    <Heart className="w-5 h-5 mr-2"/>
                    Yes
                  </button>
                  <button
                    className={`p-3 border rounded-lg flex justify-center items-center ${formData.relationship === false ? 'bg-blue-100 border-blue-400' : 'hover:bg-gray-50 border-gray-300'}`}
                    onClick={() => updateFormData('relationship', false)}
                  >
                    No
                  </button>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-3">When were you born?</h3>
                <div className="flex gap-2">
                  <select
                    className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 text-center"
                    value={formData.birthDate.day}
                    onChange={(e) => updateFormData('birthDate', {
                      ...formData.birthDate,
                      day: parseInt(e.target.value)
                    })}
                  >
                    {[...Array(31)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </select>
                  <select
                    className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 text-center"
                    value={formData.birthDate.month}
                    onChange={(e) => updateFormData('birthDate', {
                      ...formData.birthDate,
                      month: e.target.value
                    })}
                  >
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                  <select
                    className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 text-center"
                    value={formData.birthDate.year}
                    onChange={(e) => updateFormData('birthDate', {
                      ...formData.birthDate,
                      year: parseInt(e.target.value)
                    })}
                  >
                    {[...Array(90)].map((_, i) => (
                      <option key={2025 - i} value={2025 - i}>{2025 - i}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Your profile details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Where are you from?</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <MapPin size={18} className="text-gray-400"/>
                  </div>
                  <input
                    type="text"
                    placeholder="You live in"
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg"
                    value={formData.location}
                    onChange={(e) => updateFormData('location', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">What are your hobbies or interests?</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Heart size={18} className="text-gray-400"/>
                  </div>
                  <input
                    type="text"
                    placeholder="football, reading, ..."
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg"
                    value={formData.interests}
                    onChange={(e) => updateFormData('interests', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Profile Picture</h2>
            <div className="flex flex-col items-center">
              <button 
                onClick={() => {
                  // This would involve a file picker in a real implementation
                  const fakeImageUrl = "https://i.pravatar.cc/300";
                  updateFormData('profilePicture', fakeImageUrl);
                }}
                className="w-40 h-40 bg-gray-100 rounded-full overflow-hidden mb-4 relative"
              >
                {formData.profilePicture ? (
                  <img 
                    src={formData.profilePicture} 
                    alt="Profile"
                    className="w-full h-full hover:opacity-65 object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex border-dashed border-2 hover:opacity-75 border-gray-300 rounded-full items-center justify-center text-gray-400">
                    <Camera size={48}/>
                  </div>
                )}
              </button>
              <p className="text-sm text-gray-500">JPG, PNG or GIF. Max size 5MB.</p>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-300">
              <div className="flex items-center">
                <button
                  onClick={() => setAcceptLegals(!acceptLegals)}
                  className="h-5 w-5 border border-gray-300 rounded flex items-center justify-center bg-white"
                >
                  {acceptLegals && (
                    <div className="h-3 w-3 bg-blue-500 rounded"></div>
                  )}
                </button>
                <label htmlFor="terms" className="text-sm ml-2">
                  You are 14 or older and accept the <a href="#privacy" className="text-blue-600 font-medium">Privacy Policy</a> & <a href="#terms" className="text-blue-600 font-medium">Terms and Conditions</a>
                </label>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderLogin = () => {
    return (
      <div className="space-y-6 p-6">
        <h2 className="text-2xl font-semibold text-center">Welcome back</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium">Password</label>
              <a href="#forgot" className="text-sm text-blue-600 hover:text-blue-800">Forgot password?</a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>
          
          <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-800 shadow-md shadow-blue-200 transition duration-300">
            Sign In
          </button>
          
          <div className="flex items-center mt-4">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="mx-2 text-gray-500 text-sm">Or continue with</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button className="py-3 px-4 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition">
              <div className="w-5 h-5 bg-blue-500 rounded-full mr-2"></div>
              Google
            </button>
            <button className="py-3 px-4 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition">
              <div className="w-5 h-5 bg-black rounded-full mr-2"></div>
              Apple
            </button>
          </div>
          
          <p className="text-center mt-6 text-gray-600">
            Don't have an account? <button onClick={() => setShowLogin(false)} className="text-blue-600 font-medium hover:text-blue-800">Sign up</button>
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="backdrop-blur-sm bg-white/40 rounded-3xl shadow-xl border border-white/50 w-full max-w-md overflow-hidden">
        
        {showLogin ? (
          renderLogin()
        ) : (
          <>
            <div className="p-4 flex items-center border-b border-gray-200">
              <button
                onClick={() => {
                  if (step > 1) {
                    prevStep();
                  } else {
                    setShowLogin(true);
                  }
                }}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                {step > 1 ? <ArrowLeft size={20} /> : <X size={20} />}
              </button>
              <h1 className="text-lg font-semibold flex-1 text-center">Welcome to Facelinked</h1>
              <div style={{width: 32}}></div>
            </div>

            <div className="p-6">
              {renderProgress()}
              {renderStepContent()}
            </div>

            <div className="p-6 border-t border-gray-200 bg-white">
              <button
                onClick={nextStep}
                className="w-full py-4 bg-blue-500 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
                disabled={step === 5 && !acceptLegals}
              >
                {step < totalSteps ? (
                  <>
                    <span className="font-medium">Continue</span>
                    <ArrowRight size={16} />
                  </>
                ) : (
                  <span className="font-medium">Confirm & Create Account</span>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthPages;

import React, { useState } from 'react';
import {ChevronRight, User, Users, Heart, MessageCircle, MapPin, Menu, X, Share2} from 'lucide-react-native';
import {ScrollView, Share} from "react-native";

const HomePage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  //put logo without background upper left

  return (
      <ScrollView className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        {/* Navigation - Glassmorphism */}
        <nav
            className="sticky top-0 z-50 backdrop-blur-md bg-white/70 shadow-sm py-4 px-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div
                className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <Users className="h-6 w-6 text-white"/>
            </div>
            <span
                className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">Facelinked</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <a href="#" className="font-medium text-gray-600 hover:text-blue-600">Home</a>
            <a href="#" className="font-medium text-gray-600 hover:text-blue-600">About</a>
            <a href="#" className="font-medium text-gray-600 hover:text-blue-600">Features</a>
            <a href="#" className="font-medium text-gray-600 hover:text-blue-600">Testimonials</a>
          </div>

          <div className="hidden md:flex space-x-4">
            <button
                className="px-6 py-2 rounded-full backdrop-blur-md bg-white/80 border border-blue-200 text-blue-600 font-medium hover:bg-white transition duration-300">
              Login
            </button>
            <button
                className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-medium hover:from-blue-600 hover:to-blue-800 shadow-md shadow-blue-200 transition duration-300">
              Join Now
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-600">
              {mobileMenuOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
            <div className="md:hidden fixed top-16 left-0 right-0 z-40 backdrop-blur-lg bg-white/90 p-5 shadow-lg">
              <div className="flex flex-col space-y-4">
                <a href="#" className="font-medium text-gray-600 hover:text-blue-600 py-2">Home</a>
                <a href="#" className="font-medium text-gray-600 hover:text-blue-600 py-2">About</a>
                <a href="#" className="font-medium text-gray-600 hover:text-blue-600 py-2">Features</a>
                <a href="#" className="font-medium text-gray-600 hover:text-blue-600 py-2">Testimonials</a>
                <div className="flex space-x-4 py-2">
                  <button
                      className="flex-1 py-2 rounded-full backdrop-blur-md bg-white/80 border border-blue-200 text-blue-600 font-medium">
                    Login
                  </button>
                  <button
                      className="flex-1 py-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-medium">
                    Join Now
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* Hero Section with Glass Card */}
        <div className="relative flex items-center justify-center py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-blue-300/20 filter blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-blue-400/20 filter blur-3xl"></div>
          </div>

          <div
              className="relative z-10 backdrop-blur-sm bg-white/40 rounded-3xl shadow-xl border border-white/50 p-10 max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-8">
              Welcome to the <span className="bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">new social media.</span>
            </h1>
            <p className="text-xl text-gray-700 mb-10 max-w-2xl mx-auto">
              A platform designed for authentic connections, real friendships, and meaningful interactions.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <button
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-medium text-lg hover:from-blue-600 hover:to-blue-800 shadow-lg shadow-blue-200/50 transition duration-300">
                Join Now
              </button>
              <button
                  className="px-8 py-4 rounded-full backdrop-blur-md bg-white/70 border border-blue-200 text-blue-600 font-medium text-lg hover:bg-white transition duration-300">
                Login
              </button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">What
              We're About</h2>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Chat Feature */}
              <div
                  className="backdrop-blur-md bg-white/40 rounded-2xl p-8 shadow-xl border border-white/50 flex flex-col items-center text-center transform hover:scale-105 transition duration-300">
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-5 rounded-full mb-6 shadow-lg">
                  <MessageCircle className="h-8 w-8 text-white"/>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Chat</h3>
                <p className="text-gray-700">
                  Get to know the people around you better. Start meaningful conversations that
                  matter.
                </p>
              </div>

              {/* Connect Feature */}
              <div
                  className="backdrop-blur-md bg-white/40 rounded-2xl p-8 shadow-xl border border-white/50 flex flex-col items-center text-center transform hover:scale-105 transition duration-300">
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-5 rounded-full mb-6 shadow-lg">
                  <Users className="h-8 w-8 text-white"/>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Connect</h3>
                <p className="text-gray-700">
                  Connect with others in a meaningful way. We are not about fake profiles, but about real friends.
                </p>
              </div>

              {/* Share Feature */}
              <div
                  className="backdrop-blur-md bg-white/40 rounded-2xl p-8 shadow-xl border border-white/50 flex flex-col items-center text-center transform hover:scale-105 transition duration-300">
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-5 rounded-full mb-6 shadow-lg">
                  <Share2 className="h-8 mr-1 w-8 text-white"/>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Share</h3>
                <p className="text-gray-700">
                  We are not about likes, but about real connections. We are not about fake news, but about real
                  stories.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works - With Flowing Background */}
        <div className="relative py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-blue-200/30 filter blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-blue-300/30 filter blur-3xl"></div>
          </div>

          <div className="relative z-10 max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">How
              It Works</h2>

            <div className="grid md:grid-cols-3 gap-10">
              <div
                  className="backdrop-blur-md bg-white/40 rounded-2xl p-8 shadow-xl border border-white/50 flex flex-col items-center text-center">
                <div
                    className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-xl font-bold mb-6 shadow-lg">1
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Create Your Profile</h3>
                <p className="text-gray-700">Show your authentic self with a simple, genuine profile that highlights
                  your real interests.</p>
              </div>

              <div
                  className="backdrop-blur-md bg-white/40 rounded-2xl p-8 shadow-xl border border-white/50 flex flex-col items-center text-center">
                <div
                    className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-xl font-bold mb-6 shadow-lg">2
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Connect With People</h3>
                <p className="text-gray-700">Find friends and meet people near you who share your values and
                  interests.</p>
              </div>

              <div
                  className="backdrop-blur-md bg-white/40 rounded-2xl p-8 shadow-xl border border-white/50 flex flex-col items-center text-center">
                <div
                    className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white text-xl font-bold mb-6 shadow-lg">3
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Build Real Relationships</h3>
                <p className="text-gray-700">Enjoy meaningful conversations and experiences that strengthen your
                  connections.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Community Section */}
        <div className="relative py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 z-0 bg-gradient-to-r from-blue-500 to-blue-700">
            <div className="absolute top-0 left-1/3 w-64 h-64 rounded-full bg-white/10 filter blur-3xl"></div>
            <div className="absolute bottom-0 right-1/3 w-80 h-80 rounded-full bg-white/10 filter blur-3xl"></div>
          </div>

          <div
              className="relative z-10 backdrop-blur-md bg-white/10 rounded-3xl border border-white/20 p-10 max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Join Our Growing Community</h2>
            <p className="text-xl text-white/90 mb-10">
              Many people are already rediscovering what social media should be about - real people, real
              connections, and real stories.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <button
                  className="px-8 py-4 rounded-full bg-white text-blue-600 font-medium text-lg hover:bg-blue-50 shadow-lg transition duration-300">
                Join Now
              </button>
              <button
                  className="px-8 py-4 rounded-full bg-transparent border border-white text-white font-medium text-lg hover:bg-white/10 transition duration-300">
                Login
              </button>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">What
              Our Users Say</h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="backdrop-blur-md bg-white/40 rounded-2xl p-8 shadow-xl border border-white/50">
                <p className="text-gray-700 mb-6">"I've made more meaningful connections in one month on Facelinked than
                  I did in years on other platforms."</p>
                <div className="flex items-center">
                  <div
                      className="h-12 w-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mr-4 flex items-center justify-center">
                    <span className="text-white font-bold">RH</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Richard H.</h4>
                    <p className="text-gray-500">Member since 2024</p>
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-md bg-white/40 rounded-2xl p-8 shadow-xl border border-white/50">
                <p className="text-gray-700 mb-6">"Finally, a social network that values quality over quantity. I feel
                  heard and seen on Facelinked."</p>
                <div className="flex items-center">
                  <div
                      className="h-12 w-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mr-4 flex items-center justify-center">
                    <span className="text-white font-bold">RF</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Richard F.</h4>
                    <p className="text-gray-500">Member since 2023</p>
                  </div>
                </div>

              </div>

              <div className="backdrop-blur-md bg-white/40 rounded-2xl p-8 shadow-xl border border-white/50">
                <p className="text-gray-700 mb-12">"Real friends. Real Connections. Real stories."</p>
                <div className="flex items-center">
                  <div
                      className="h-12 w-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mr-4 flex items-center justify-center">
                    <span className="text-white font-bold">SW</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">Steve W.</h4>
                    <p className="text-gray-500">Member since 2024</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <footer className="bg-gray-800 text-gray-300 py-10 px-4 mt-auto">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-blue-600"></div>
                  <span className="font-bold text-xl text-white">Facelinked</span>
                </div>
                <p>Redefining social media through authentic connections and meaningful interactions.</p>
              </div>

              <div>
                <h3 className="font-bold text-white mb-4">Features</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-blue-400">Chat</a></li>
                  <li><a href="#" className="hover:text-blue-400">Connect</a></li>
                  <li><a href="#" className="hover:text-blue-400">Share</a></li>
                  <li><a href="#" className="hover:text-blue-400">Discover</a></li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-white mb-4">Company</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-blue-400">About Us</a></li>
                  <li><a href="#" className="hover:text-blue-400">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-blue-400">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-blue-400">Contact</a></li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-white mb-4">Join Us</h3>
                <p className="mb-4">Sign up for our newsletter to get updates and early access.</p>
                <div className="flex">
                  <input type="email" placeholder="Your email" className="px-4 py-2 rounded-l-md w-full focus:outline-none text-gray-800" />
                  <button className="bg-blue-600 px-4 py-2 rounded-r-md hover:bg-blue-700">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700 mt-8 pt-8 text-center">
              <p>&copy; 2025 Facelinked. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </ScrollView>)
}
export default HomePage;

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Pressable, Image, Platform } from 'react-native';
import { Eye, EyeOff, ArrowLeft, X, Mail, Lock, Heart, MapPin, Camera, ArrowRight, Users, Check } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

const RegistrationPage = ({ navigateTo }) => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [acceptLegals, setAcceptLegals] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    relationship: null,
    birthDate: { day: 15, month: 'March', year: 2025 },
    location: '',
    interests: '',
    profilePicture: null
  });

  const totalSteps = 5;

  const updateFormData = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Submit form data and create account
      console.log('Form submitted:', formData);
      // Navigate to home or onboarding
      navigateTo('home');
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderProgress = () => {
    return (
      <View className="w-full mb-8">
        <View className="flex flex-row justify-between mb-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <View
              key={index}
              className={`w-8 h-8 rounded-full flex items-center justify-center 
                ${index + 1 === step ? 'bg-blue-500' : 
                  index + 1 < step ? 'bg-green-400' : 'bg-gray-200'}`}
            >
              {index + 1 < step ? (
                <Check size={16} color="white" />
              ) : (
                <Text className={index + 1 === step ? 'text-white' : 'text-gray-700'}>
                  {index + 1}
                </Text>
              )}
            </View>
          ))}
        </View>
        <View className="w-full bg-gray-200 h-2 rounded-full">
          <View
            className="bg-blue-500 h-2 rounded-full"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </View>
      </View>
    );
  };

  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <View className="space-y-6">
            <Text className="text-2xl font-semibold">Let's get started</Text>
            <View className="space-y-4">
              <View>
                <Text className="block text-sm font-medium mb-1">Your Name</Text>
                <TextInput
                  placeholder="Enter your name"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white/90"
                  value={formData.name}
                  onChangeText={(text) => updateFormData('name', text)}
                />
              </View>
              <View>
                <Text className="block text-sm font-medium mb-1">Choose a Username</Text>
                <TextInput
                  placeholder="Enter username"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white/90"
                  value={formData.username}
                  onChangeText={(text) => updateFormData('username', text)}
                />
              </View>
            </View>
          </View>
        );
      case 2:
        return (
          <View className="space-y-6">
            <Text className="text-2xl font-semibold">Your account details</Text>
            <View className="space-y-4">
              <View>
                <Text className="block text-sm font-medium mb-1">Email</Text>
                <View className="relative">
                  <View className="absolute inset-y-0 left-0 justify-center pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400" />
                  </View>
                  <TextInput
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-white/90"
                    value={formData.email}
                    onChangeText={(text) => updateFormData('email', text)}
                    keyboardType="email-address"
                  />
                </View>
              </View>
              <View>
                <Text className="block text-sm font-medium mb-1">Password</Text>
                <View className="relative">
                  <View className="absolute inset-y-0 left-0 justify-center pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-400" />
                  </View>
                  <TextInput
                    secureTextEntry={!showPassword}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-white/90"
                    value={formData.password}
                    onChangeText={(text) => updateFormData('password', text)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 justify-center flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff size={18} className="text-gray-400" />
                    ) : (
                      <Eye size={18} className="text-gray-400" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
              <View className="mt-6">
                <View className="flex-row items-center">
                  <View className="flex-1 h-px bg-gray-300" />
                  <Text className="mx-2 text-gray-500 text-sm">Or continue with</Text>
                  <View className="flex-1 h-px bg-gray-300" />
                </View>

                <View className="mt-6 flex flex-row space-x-3">
                  <TouchableOpacity 
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-lg flex items-center flex-row justify-center bg-white"
                  >
                    <View className="w-5 h-5 bg-blue-500 rounded-full mr-2"></View>
                    <Text>Google</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className="flex-1 py-3 px-4 border border-gray-300 rounded-lg flex items-center flex-row justify-center bg-white"
                  >
                    <View className="w-5 h-5 bg-black rounded-full mr-2"></View>
                    <Text>Apple</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        );
      case 3:
        return (
          <View className="space-y-6">
            <Text className="text-2xl font-semibold">Tell us about yourself</Text>
            <View className="space-y-6">
              <View>
                <Text className="text-lg font-medium mb-3">Are you in a relationship?</Text>
                <View className="flex flex-row gap-4">
                  <TouchableOpacity 
                    className={`flex-1 p-3 border rounded-lg flex flex-row justify-center items-center ${formData.relationship === true ? 'bg-blue-100 border-blue-400' : 'border-gray-300'}`}
                    onPress={() => updateFormData('relationship', true)}
                  >
                    <Heart size={16} className="mr-2"/>
                    <Text>Yes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className={`flex-1 p-3 border rounded-lg flex flex-row justify-center items-center ${formData.relationship === false ? 'bg-blue-100 border-blue-400' : 'border-gray-300'}`}
                    onPress={() => updateFormData('relationship', false)}
                  >
                    <Text>No</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View>
                <Text className="text-lg font-medium mb-3">When were you born?</Text>
                <View className="flex-row flex gap-2">
                  {Platform.OS === 'web' && (
                    <>
                      <View className="flex-1">
                        <Pressable className="p-3 border border-gray-300 rounded-lg bg-white text-center">
                          <Text>{formData.birthDate.day}</Text>
                        </Pressable>
                      </View>
                      <View className="flex-1">
                        <Pressable className="p-3 border border-gray-300 rounded-lg bg-white text-center">
                          <Text>{formData.birthDate.month}</Text>
                        </Pressable>
                      </View>
                      <View className="flex-1">
                        <Pressable className="p-3 border border-gray-300 rounded-lg bg-white text-center">
                          <Text>{formData.birthDate.year}</Text>
                        </Pressable>
                      </View>
                    </>
                  )}
                </View>
              </View>
            </View>
          </View>
        );
      case 4:
        return (
          <View className="space-y-6">
            <Text className="text-2xl font-semibold">Your profile details</Text>
            <View className="space-y-4">
              <View>
                <Text className="block text-sm font-medium mb-1">Where are you from?</Text>
                <View className="relative">
                  <View className="absolute inset-y-0 left-0 justify-center pl-3 flex items-center pointer-events-none">
                    <MapPin size={18} className="text-gray-400"/>
                  </View>
                  <TextInput
                    placeholder="You live in"
                    placeholderTextColor="gray"
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-white/90"
                    value={formData.location}
                    onChangeText={(text) => updateFormData('location', text)}
                  />
                </View>
              </View>
              <View>
                <Text className="block text-sm font-medium mb-1">What are your hobbies or interests?</Text>
                <TextInput
                  placeholder="football, reading, ..."
                  placeholderTextColor="gray"
                  className="w-full py-3 px-4 border border-gray-300 rounded-lg bg-white/90"
                  value={formData.interests}
                  onChangeText={(text) => updateFormData('interests', text)}
                />
              </View>
            </View>
          </View>
        );
      case 5:
        return (
          <View className="space-y-6">
            <Text className="text-2xl font-semibold">Profile Picture</Text>
            <View className="flex flex-col items-center">
              <TouchableOpacity 
                onPress={async () => {
                  const result = await ImagePicker.launchImageLibraryAsync({
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.8,
                  });

                  if (!result.canceled) {
                    updateFormData('profilePicture', result.assets[0].uri);
                  }
                }}
                className="w-40 h-40 bg-gray-100 rounded-full overflow-hidden mb-4 relative"
              >
                {formData.profilePicture ? (
                  <Image source={{uri: formData.profilePicture}} className="w-full h-full object-cover" />
                ) : (
                  <View className="absolute inset-0 flex border-dashed border-2 border-gray-300 rounded-full items-center justify-center">
                    <Camera size={48} className="text-gray-400" />
                  </View>
                )}
              </TouchableOpacity>
              <Text className="text-sm text-gray-500">JPG, PNG or GIF. Max size 5MB.</Text>
            </View>
            <View className="mt-6 pt-6 border-t border-gray-300">
              <View className="flex-row items-center">
                <Pressable
                  onPress={() => setAcceptLegals(!acceptLegals)}
                  className="h-5 w-5 border border-gray-300 rounded flex items-center justify-center bg-white"
                >
                  {acceptLegals && (
                    <View className="h-3 w-3 bg-blue-500 rounded"></View>
                  )}
                </Pressable>
                <Text className="text-sm ml-2">
                  You are 14 or older and accept the <Text className="text-blue-600 font-medium">Privacy Policy</Text> & <Text className="text-blue-600 font-medium">Terms and Conditions</Text>
                </Text>
              </View>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <View className="p-4 flex-row items-center border-b border-gray-200 bg-white/70 backdrop-blur-md">
        <TouchableOpacity
          onPress={() => {
            if (step > 1) {
              prevStep();
            } else {
              navigateTo('login');
            }
          }}
          className="p-2 rounded-full"
        >
          {step > 1 ? <ArrowLeft size={20} /> : <X size={20} />}
        </TouchableOpacity>
        <View className="flex-1 flex items-center">
          <Text className="text-lg font-semibold">Welcome to Facelinked</Text>
        </View>
        <View style={{width: 32}}></View>
      </View>

      {/* Main Content */}
      <ScrollView className="flex-1">
        <View className="p-6 max-w-md mx-auto w-full">
          {renderProgress()}
          {renderStepContent()}
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="p-6 border-t border-gray-200 bg-white/70 backdrop-blur-md">
        <View className="max-w-md mx-auto w-full">
          <TouchableOpacity
            onPress={nextStep}
            className={`w-full py-4 rounded-lg flex flex-row items-center justify-center gap-2 ${acceptLegals || step < 5 ? 'bg-gradient-to-r from-blue-500 to-blue-700' : 'bg-gray-300'}`}
            disabled={step === 5 && !acceptLegals}
          >
            {step < totalSteps ? (
              <>
                <Text className="text-white font-medium">Continue</Text>
                <ArrowRight size={16} color="white" />
              </>
            ) : (
              <Text className="text-white font-medium">Confirm & Create Account</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default RegistrationPage;

import { View, Text, TextInput, TouchableOpacity, ScrollView, Pressable, Image } from 'react-native';
import { Eye, EyeOff, Mail, Lock, ChevronRight, ArrowRight, Users } from 'lucide-react-native';

const LoginPage = ({ navigateTo }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    // Implement login logic here
    console.log('Login with:', email, password);
    // Navigate to home after successful login
    navigateTo('home');
  };

  return (
    <ScrollView className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header with Logo */}
      <View className="pt-12 pb-6 px-6 flex items-center">
        <View className="flex items-center space-y-2">
          <View className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <Users className="h-8 w-8 text-white" />
          </View>
          <Text className="font-bold text-3xl bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
            Facelinked
          </Text>
        </View>
      </View>

      {/* Login Form */}
      <View className="px-6 py-8">
        <View className="backdrop-blur-sm bg-white/80 rounded-3xl shadow-xl border border-white/50 p-8">
          <Text className="text-2xl font-bold text-gray-800 mb-6">Welcome back</Text>
          
          {/* Email Input */}
          <View className="mb-5">
            <Text className="block text-sm font-medium mb-2 text-gray-700">Email</Text>
            <View className="relative">
              <View className="absolute inset-y-0 left-0 justify-center pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </View>
              <TextInput
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white/90"
                keyboardType="email-address"
              />
            </View>
          </View>

          {/* Password Input */}
          <View className="mb-5">
            <Text className="block text-sm font-medium mb-2 text-gray-700">Password</Text>
            <View className="relative">
              <View className="absolute inset-y-0 left-0 justify-center pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </View>
              <TextInput
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-white/90"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 justify-center flex items-center"
              >
                {showPassword ? <EyeOff size={18} className="text-gray-400" /> : <Eye size={18} className="text-gray-400" />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Remember Me and Forgot Password */}
          <View className="flex flex-row justify-between items-center mb-6">
            <View className="flex flex-row items-center">
              <Pressable
                onPress={() => setRememberMe(!rememberMe)}
                className="h-5 w-5 border border-gray-300 rounded flex items-center justify-center bg-white mr-2"
              >
                {rememberMe && (
                  <View className="h-3 w-3 bg-blue-500 rounded"></View>
                )}
              </Pressable>
              <Text className="text-sm text-gray-600">Remember me</Text>
            </View>
            <TouchableOpacity>
              <Text className="text-sm text-blue-600 font-medium">Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            className="w-full py-3 mb-5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 shadow-md shadow-blue-200"
          >
            <Text className="text-white font-medium text-center">Login</Text>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex flex-row items-center my-6">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-gray-500 text-sm">Or continue with</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Social Login Buttons */}
          <View className="flex flex-row space-x-4 mb-6">
            <TouchableOpacity className="flex-1 py-3 px-4 border border-gray-300 rounded-lg flex items-center flex-row justify-center bg-white">
              <View className="w-5 h-5 bg-blue-500 rounded-full mr-2"></View>
              <Text>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 py-3 px-4 border border-gray-300 rounded-lg flex items-center flex-row justify-center bg-white">
              <View className="w-5 h-5 bg-black rounded-full mr-2"></View>
              <Text>Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Register Link */}
          <View className="flex flex-row justify-center">
            <Text className="text-gray-600">Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigateTo('register')} className="ml-1">
              <Text className="text-blue-600 font-medium">Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View className="py-8 px-6">
        <Text className="text-center text-gray-500 text-sm">
          &copy; 2025 Facelinked. All rights reserved.
        </Text>
      </View>
    </ScrollView>
  );
};

export default LoginPage;

