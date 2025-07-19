import { BookOpen, Cloud, Zap, Brain, Sparkles, Calendar, Shield, Clock } from "lucide-react";

const benefits = [
  {
    title: "Effortless Note-Taking",
    description: "Capture thoughts effortlessly with our intuitive interface designed for seamless journaling.",
    icon: BookOpen,
    color: "blue",
  },
  {
    title: "Seamless Sync",
    description: "Access your notes anytime, anywhere, with seamless cloud synchronization across all devices.",
    icon: Cloud,
    color: "green",
  },
  {
    title: "Enhanced Productivity",
    description: "Let AI handle organization, so you can focus on what matters most in your daily life.",
    icon: Zap,
    color: "purple",
  },
  {
    title: "AI-Powered Insights",
    description: "Gain valuable insights with smart analytics based on your note patterns and habits.",
    icon: Brain,
    color: "orange",
  },
  {
    title: "Smart Habit Tracking",
    description: "Build better habits with our intelligent tracking system and progress analytics.",
    icon: Calendar,
    color: "pink",
  },
  {
    title: "Secure & Private",
    description: "Your data is protected with enterprise-grade security and privacy controls.",
    icon: Shield,
    color: "indigo",
  },
];

const colorClasses = {
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  purple: "bg-purple-100 text-purple-600",
  orange: "bg-orange-100 text-orange-600",
  pink: "bg-pink-100 text-pink-600",
  indigo: "bg-indigo-100 text-indigo-600",
};

const Benefits = () => {
  return (
    <section id="Benefits" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Features
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Why Choose <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">MosAIc</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the perfect blend of AI-powered intelligence and intuitive design
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <div
                key={index}
                className="group bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`inline-flex p-3 rounded-xl ${colorClasses[benefit.color as keyof typeof colorClasses]} mb-6`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
