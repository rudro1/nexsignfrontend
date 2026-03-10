import React from 'react';
import { Card, CardContent } from './ui/Card';
import { Upload, Link, PenTool, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
export function FeaturesSection() {
  const features = [
  {
    icon: Upload,
    title: 'Upload & Map Signature',
    description:
    'Easily upload PDF documents and drag-and-drop signature fields exactly where you need them.'
  },
  {
    icon: Link,
    title: 'Unique Secure Link',
    description:
    'Generate encrypted, unique signing links for each recipient to ensure document security.'
  },
  {
    icon: PenTool,
    title: 'Digital Canvas Signature',
    description:
    'Provide a smooth signing experience on any device with our responsive digital signature canvas.'
  },
  {
    icon: Mail,
    title: 'Automated Storage & Email',
    description:
    'Once signed, documents are automatically saved and emailed to all parties instantly.'
  }];

  return (
    <section id="features" className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Everything You Need for Seamless Signing
          </h2>
          <p className="text-lg text-slate-600">
            Powerful features designed to make document signing faster, safer,
            and easier for everyone involved.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) =>
          <motion.div
            key={index}
            initial={{
              opacity: 0,
              y: 20
            }}
            whileInView={{
              opacity: 1,
              y: 0
            }}
            viewport={{
              once: true
            }}
            transition={{
              duration: 0.5,
              delay: index * 0.1
            }}>

              <Card className="h-full border-none shadow-lg shadow-slate-100 hover:shadow-xl transition-shadow duration-300">
                <CardContent className="pt-8 flex flex-col items-center text-center h-full">
                  <div className="w-14 h-14 rounded-full bg-sky-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-7 w-7 text-sky-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

}