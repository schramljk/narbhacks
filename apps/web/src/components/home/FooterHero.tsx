import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/common/button";
import { ArrowRight, Sparkles, BookOpen, Calendar } from "lucide-react";

const FooterHero = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800">
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Ready to Get Started?
              </div>
              <h2 className="text-4xl sm:text-6xl font-bold text-white leading-tight">
                Start Your Intelligent <br />
                <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Note-Taking Journey
                </span>
              </h2>
            </div>
            
            <p className="text-xl text-blue-100 leading-relaxed max-w-2xl">
              Sign up now and experience the power of AI-enhanced note-taking with MosAIc
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-100">
                <Link href="/notes" className="flex items-center gap-2">
                  Get Started For Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-2 gap-6 pt-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">Smart Journaling</p>
                  <p className="text-sm text-blue-100">AI-powered insights</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">Habit Tracking</p>
                  <p className="text-sm text-blue-100">Build better habits</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative max-w-lg mx-auto">
              <div className="absolute inset-0 bg-white/10 rounded-3xl blur-3xl"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8">
                <Image
                  src="/images/monitor.png"
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
    </div>
  );
};

export default FooterHero;
