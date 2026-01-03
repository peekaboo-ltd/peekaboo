import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faUsers,
  faMapLocationDot,
  faPhone,
  faEnvelope,
  faFileAlt,
  faTruck,
  faCalendarAlt,
} from '@fortawesome/free-solid-svg-icons';

const About = () => {
  const boardMembers = [
    {
      name: 'RWEMA Remy MULIGANDE',
      role: 'Managing Director & Member',
      location: 'Rusororo, Gasabo, Kigali',
    },
    {
      name: 'Elysée Prince NISHIMWE',
      role: 'Chair Person',
      location: 'Niboye, Kicukiro, Kigali',
    },
    {
      name: 'David Benimana Mugerangabo',
      role: 'Member',
      location: 'Gikondo, Kicukiro, Kigali',
    },
  ];

  const shareholders = [
    { name: 'RWEMA Remy MULIGANDE', shares: 10, capital: '2,000,000 RWF' },
    { name: 'Elysée Prince NISHIMWE', shares: 10, capital: '2,000,000 RWF' },
    { name: 'David Benimana Mugerangabo', shares: 10, capital: '2,000,000 RWF' },
  ];

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

          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  icon={faFileAlt}
                  className="text-primary-600 text-xl"
                />
              </figure>
              <h3 className="font-semibold text-gray-900 mb-1">Company Code</h3>
              <p className="text-gray-600">147521530</p>
            </article>

            <article className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <figure className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className="text-primary-600 text-xl"
                />
              </figure>
              <h3 className="font-semibold text-gray-900 mb-1">
                Registration Date
              </h3>
              <p className="text-gray-600">August 14, 2024</p>
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

      {/* Board of Directors */}
      <section className="py-16 lg:py-24">
        <article className="max-w-[1330px] mx-auto px-4 sm:px-6 lg:px-12">
          <header className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              <FontAwesomeIcon icon={faUsers} className="mr-3" />
              Board of Directors
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Meet the leadership team behind Peekaboo Ltd.
            </p>
          </header>

          <ul className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {boardMembers.map((member, index) => (
              <li
                key={index}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 text-center"
              >
                <figure className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-700">
                    {member.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </span>
                </figure>
                <h3 className="font-semibold text-gray-900 text-lg mb-1">
                  {member.name}
                </h3>
                <p className="text-primary-600 font-medium mb-2">{member.role}</p>
                <address className="text-sm text-gray-500 not-italic">
                  {member.location}
                </address>
              </li>
            ))}
          </ul>
        </article>
      </section>

      {/* Capital Information */}
      <section className="py-16 lg:py-24 bg-white">
        <article className="max-w-[1330px] mx-auto px-4 sm:px-6 lg:px-12">
          <header className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Share Capital Information
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Peekaboo Ltd has a share capital of{' '}
              <strong>6,000,000 RWF</strong> divided into{' '}
              <strong>30 ordinary shares</strong> at{' '}
              <strong>200,000 RWF</strong> par value per share.
            </p>
          </header>

          <section className="overflow-x-auto">
            <table className="w-full max-w-4xl mx-auto bg-gray-50 rounded-lg overflow-hidden">
              <thead className="bg-primary-900 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">
                    Shareholder Name
                  </th>
                  <th className="px-6 py-4 text-center font-semibold">
                    Number of Shares
                  </th>
                  <th className="px-6 py-4 text-right font-semibold">
                    Share Capital
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {shareholders.map((shareholder, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {shareholder.name}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">
                      {shareholder.shares}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-600">
                      {shareholder.capital}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100">
                <tr>
                  <td className="px-6 py-4 font-bold text-gray-900">Total</td>
                  <td className="px-6 py-4 text-center font-bold text-gray-900">
                    30
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    6,000,000 RWF
                  </td>
                </tr>
              </tfoot>
            </table>
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
                <div className="flex justify-between">
                  <dt className="text-gray-600">Serial No:</dt>
                  <dd className="font-medium text-gray-900">1632727</dd>
                </div>
              </dl>
            </article>

            <article className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">
                Share Details
              </h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Share Group:</dt>
                  <dd className="font-medium text-gray-900">Ordinary Share</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Par Value:</dt>
                  <dd className="font-medium text-gray-900">200,000 RWF</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Total Shares:</dt>
                  <dd className="font-medium text-gray-900">30</dd>
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
