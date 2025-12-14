import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { steps, howItWorksContent, containerVariants, itemVariants } from '../constants/howItWorks.constants';

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-12 sm:py-16 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-12 md:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            {howItWorksContent.title}
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            {howItWorksContent.subtitle}
          </p>
        </motion.header>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
        >
          {steps.map((step, index) => (
            <motion.article
              key={step.title}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative bg-white rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {/* Step Number */}
              <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center text-white font-bold shadow-lg text-sm sm:text-base" aria-label={`Step ${index + 1}`}>
                {index + 1}
              </div>

              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: step.delay + 0.2, type: 'spring', stiffness: 200 }}
                className={`w-12 h-12 sm:w-14 sm:h-14 ${step.color} rounded-xl flex items-center justify-center mb-3 sm:mb-4`}
                aria-hidden="true"
              >
                <FontAwesomeIcon icon={step.icon} className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </motion.div>

              {/* Content */}
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                {step.description}
              </p>

              {/* Connector Line (hidden on last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-gray-300 to-transparent" aria-hidden="true" />
              )}
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
