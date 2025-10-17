"use client";
import { useState } from "react";
import RegisterForm from "../components/registerform";
import { motion, AnimatePresence } from "framer-motion";

export default function WishingWellPage() {
  const [showWishSheet, setShowWishSheet] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-6">Wishing Well</h1>
      <button
        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        onClick={() => setShowWishSheet(true)}
      >
        Add your wish to the wishing well
      </button>

      <AnimatePresence>
        {showWishSheet && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className="fixed bottom-0 left-0 w-full z-50 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowWishSheet(false)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-md mx-auto bg-white rounded-t-[40px] shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <RegisterForm onClose={() => setShowWishSheet(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}