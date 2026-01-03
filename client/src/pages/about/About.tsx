import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faMapLocationDot,
  faPhone,
  faEnvelope,
  faTruck,
} from '@fortawesome/free-solid-svg-icons';

const About = () => {

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-primary-900 text-white py-20">
        <article className="max-w-[1330px] mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">About Peekaboo</h1>
          <p className="text-xl text-primary-200 max-w-3xl mx-auto">
            A trusted courier and delivery service company registered in Rwanda,
            connecting senders with reliable riders across Kigali.
          </p>
        </article>
      </section>

      {/* Company Overview */}
      <section className="py-16 lg:py-24">
        <article className="max-w-[1330px] mx-auto px-4 sm:px-6 lg:px-12">
          <header className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Company Overview
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Peekaboo Ltd is a private limited company providing courier
              activities across Rwanda.
            </p>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <article className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <figure className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <FontAwesomeIcon
                  icon={faBuilding}
                  className="text-primary-600 text-xl"
                />
              </figure>
              <h3 className="font-semibold text-gray-900 mb-1">Company Name</h3>
              <p className="text-gray-600">PEEKABOO Ltd</p>
            </article>

            <article className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <figure className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <FontAwesomeIcon
                  icon={faTruck}
                  className="text-primary-600 text-xl"
                />
              </figure>
              <h3 className="font-semibold text-gray-900 mb-1">
                Business Activity
              </h3>
              <p className="text-gray-600">Courier Activities (H5320)</p>
            </article>
          </section>
        </article>
      </section>

      {/* Registered Office */}
      <section className="py-16 lg:py-24 bg-white">
        <article className="max-w-[1330px] mx-auto px-4 sm:px-6 lg:px-12">
          <header className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Registered Office
            </h2>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <article className="bg-gray-50 rounded-lg p-6 text-center">
              <FontAwesomeIcon
                icon={faMapLocationDot}
                className="text-primary-600 text-3xl mb-4"
              />
              <h3 className="font-semibold text-gray-900 mb-2">Address</h3>
              <address className="text-gray-600 not-italic">
                Niboye, Kicukiro
                <br />
                Umujyi wa Kigali
                <br />
                RWANDA
              </address>
            </article>

            <article className="bg-gray-50 rounded-lg p-6 text-center">
              <FontAwesomeIcon
                icon={faPhone}
                className="text-primary-600 text-3xl mb-4"
              />
              <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
              <p className="text-gray-600">+250 788 XXX XXX</p>
            </article>

            <article className="bg-gray-50 rounded-lg p-6 text-center">
              <FontAwesomeIcon
                icon={faEnvelope}
                className="text-primary-600 text-3xl mb-4"
              />
              <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">info@peekaboo.co.rw</p>
            </article>
          </section>
        </article>
      </section>

      {/* Company Type Info */}
      <section className="py-16 lg:py-24">
        <article className="max-w-[1330px] mx-auto px-4 sm:px-6 lg:px-12">
          <header className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Legal Information
            </h2>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <article className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">
                Company Type
              </h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Category:</dt>
                  <dd className="font-medium text-gray-900">Private</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Type:</dt>
                  <dd className="font-medium text-gray-900">Limited by Shares</dd>
                </div>
              </dl>
            </article>

            <article className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">
                Business Information
              </h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Activity:</dt>
                  <dd className="font-medium text-gray-900">Courier Services</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Location:</dt>
                  <dd className="font-medium text-gray-900">Kigali, Rwanda</dd>
                </div>
              </dl>
            </article>
          </section>
        </article>
      </section>

      {/* CTA */}
      <section className="bg-primary-900 py-16">
        <article className="max-w-[1330px] mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Experience Fast Delivery?
          </h2>
          <p className="text-lg text-primary-200 max-w-2xl mx-auto mb-8">
            Join thousands of satisfied customers using Peekaboo for their
            delivery needs.
          </p>
          <Link
            to="/"
            className="inline-block bg-white text-primary-900 px-8 py-3 rounded font-semibold hover:bg-gray-100 transition-colors"
          >
            Get Started
          </Link>
        </article>
      </section>
    </main>
  );
};

export default About;
