import Image from "next/image";
import { Star, Quote } from "lucide-react";

const TestimonialsData = [
  {
    rating: 5,
    review: "Great note-taking application! The AI features make note-taking a breeze and the habit tracker keeps me motivated.",
    name: "Ryan Lowry",
    designation: "Engineer & Author",
    profile: "/images/profile.png",
  },
  {
    rating: 5,
    review: "Really like the clean design of MosAIc. The AI-driven search is impressively accurate, adding a personal dimension to my notes. Fast and very easy to use.",
    name: "John Collins",
    designation: "Product Manager",
    profile: "/images/profile.png",
  },
  {
    rating: 5,
    review: "Simply brilliant! MosAIc has elevated my productivity. The journal feature helps me reflect on my day, and the habit tracker keeps me accountable.",
    name: "Moe Partuj",
    designation: "Student",
    profile: "/images/Moe-Partuj.jpeg",
  },
];

const Testimonials = () => {
  return (
    <section id="reviews" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium mb-4">
            <Star className="w-4 h-4" />
            Testimonials
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            What Our Users Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of users who have transformed their productivity with MosAIc
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TestimonialsData.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <div className="mb-6">
                <Quote className="w-8 h-8 text-blue-200 mb-4" />
                <p className="text-gray-600 leading-relaxed">
                  "{item.review}"
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Image
                  src={item.profile}
                  width={48}
                  height={48}
                  alt={item.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.designation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
