import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/common/button";
import { BookOpen, Sparkles, Calendar, Zap } from "lucide-react";

const Hero = () => {
  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                AI-Powered Journaling
              </div>
              <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 leading-tight">
                The Ultimate <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Organization Experience
                </span>
              </h1>
            </div>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
              MosAIc harnesses the power of artificial intelligence to
              revolutionize the way you capture, organize, and recall your
              daily life.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="text-lg px-8 py-4">
                <Link href="/notes">
                  Get Started
                </Link>
              </Button>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-2 gap-6 pt-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Smart Journaling</p>
                  <p className="text-sm text-gray-600">AI-powered insights</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Habit Tracking</p>
                  <p className="text-sm text-gray-600">Build better habits</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative max-w-lg mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-3xl opacity-20 blur-3xl"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-2xl">
                <Image
                  src="/images/hero.png"
                  width={500}
                  height={400}
                  alt="MosAIc App Preview"
                  className="w-full h-auto rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
