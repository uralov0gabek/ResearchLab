import React from 'react';

const studyAreas = [
  {
    title: "Financial Decision Making",
    description: "How individuals evaluate investments, savings, and debt when faced with potential losses.",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Healthcare Choices",
    description: "The impact of risk framing on medical treatment decisions and preventative care.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Consumer Behavior",
    description: "How loss aversion drives purchasing habits, brand loyalty, and responses to marketing.",
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Public Policy",
    description: "Designing policies that account for cognitive biases to encourage socially beneficial actions.",
    image: "https://images.unsplash.com/photo-1523292562811-8fa7962a78c8?auto=format&fit=crop&q=80&w=800",
  }
];

export const StudyAreas: React.FC = () => {
  return (
    <section className="py-20 bg-brand-cream">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-charcoal mb-4">What We Study</h2>
          <p className="text-lg text-brand-charcoal/70">
            Our research spans multiple domains where risk and uncertainty play a critical role.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {studyAreas.map((area, index) => (
            <div key={index} className="group relative overflow-hidden rounded-2xl bg-white border border-brand-charcoal/10 hover:shadow-xl transition-all duration-300">
              <div className="aspect-w-4 aspect-h-3 overflow-hidden">
                <img 
                  src={area.image} 
                  alt={area.title} 
                  className="object-cover w-full h-48 group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-brand-charcoal mb-2">{area.title}</h3>
                <p className="text-sm text-brand-charcoal/70 leading-relaxed">
                  {area.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
