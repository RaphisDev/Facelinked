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