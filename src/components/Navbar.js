import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const navigation = [
  { name: 'Accueil', href: '/', current: true },
  { name: 'Annonces', href: '/announcements', current: false },
  { name: 'Mes demandes', href: '/requests', current: false },
];

const userNavigation = [
  { name: 'Profil', href: '/profile' },
  { name: 'Paramètres', href: '/settings' },
];

const adminNavigation = [
  { name: 'Tableau de Bord', href: '/admin/dashboard' },
  { name: 'Gestion Utilisateurs', href: '/admin/users' },
  { name: 'Gestion Annonces', href: '/admin/announcements' },
  { name: 'Gestion Demandes', href: '/admin/requests' },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <Disclosure as="nav" className="bg-gray-500">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Link to="/" className="text-white font-bold text-xl">
                    TransportConnect
                  </Link>
                </div>
                <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={classNames(
                          item.current
                            ? ' hover:bg-gray-700 text-white'
                            : 'text-white hover:bg-gray-700 hover:text-white',
                          'rounded-md px-3 py-2 text-sm font-medium'
                        )}
                      >
                        {item.name}
                      </Link>
                    ))}
                    {user?.isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        className="text-yellow-300 hover:bg-yellow-700 hover:text-white rounded-md px-3 py-2 text-sm "
                      >
                         Administration
                      </Link>
                    )}
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="ml-4 flex items-center md:ml-6">
                  {user ? (
                    <Menu as="div" className="relative ml-3">
                      <div>
                        <Menu.Button className="flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                          <span className="sr-only">Ouvrir le menu utilisateur</span>
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white ${user.isAdmin ? 'bg-yellow-500' : 'bg-gray-500'}`}>
                            {user.isAdmin ? '👑' : user.firstName[0]}
                          </div>
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {user.isAdmin && (
                            <>
                              <div className="px-4 py-2 text-xs font-semibold text-gray-500 border-b">
                                ADMINISTRATION
                              </div>
                              {adminNavigation.map((item) => (
                                <Menu.Item key={item.name}>
                                  {({ active }) => (
                                    <Link
                                      to={item.href}
                                      className={classNames(
                                        active ? 'bg-yellow-50' : '',
                                        'block px-4 py-2 text-sm text-gray-700'
                                      )}
                                    >
                                      {item.name}
                                    </Link>
                                  )}
                                </Menu.Item>
                              ))}
                              <div className="px-4 py-2 text-xs font-semibold text-gray-500 border-b">
                                UTILISATEUR
                              </div>
                            </>
                          )}
                          {userNavigation.map((item) => (
                            <Menu.Item key={item.name}>
                              {({ active }) => (
                                <Link
                                  to={item.href}
                                  className={classNames(
                                    active ? 'bg-gray-100' : '',
                                    'block px-4 py-2 text-sm text-gray-700'
                                  )}
                                >
                                  {item.name}
                                </Link>
                              )}
                            </Menu.Item>
                          ))}
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={logout}
                                className={classNames(
                                  active ? 'bg-gray-100' : '',
                                  'block w-full text-left px-4 py-2 text-sm text-gray-700'
                                )}
                              >
                                Déconnexion
                              </button>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  ) : (
                    <div className="flex space-x-4">
                      <Link
                        to="/login"
                        className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
                      >
                        Connexion
                      </Link>
                      <Link
                        to="/register"
                        className="bg-primary-600 text-white hover:bg-primary-700 rounded-md px-3 py-2 text-sm font-medium"
                      >
                        Inscription
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              <div className="-mr-2 flex md:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                  <span className="sr-only">Ouvrir le menu principal</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  to={item.href}
                  className={classNames(
                    item.current
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                    'block rounded-md px-3 py-2 text-base font-medium'
                  )}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
              {user?.isAdmin && (
                <Disclosure.Button
                  as={Link}
                  to="/admin/dashboard"
                  className="text-yellow-300 hover:bg-yellow-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium border border-yellow-300"
                >
                  👑 Administration
                </Disclosure.Button>
              )}
            </div>
            {user ? (
              <div className="border-t border-gray-700 pb-3 pt-4">
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${user.isAdmin ? 'bg-yellow-500' : 'bg-gray-500'}`}>
                      {user.isAdmin ? '👑' : user.firstName[0]}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium leading-none text-white">
                      {user.firstName} {user.lastName}
                      {user.isAdmin && <span className="ml-2 text-yellow-300">👑</span>}
                    </div>
                    <div className="text-sm font-medium leading-none text-gray-400">
                      {user.email}
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1 px-2">
                  {user.isAdmin && (
                    <>
                      <div className="px-3 py-2 text-xs font-semibold text-gray-400 border-b border-gray-600">
                        ADMINISTRATION
                      </div>
                      {adminNavigation.map((item) => (
                        <Disclosure.Button
                          key={item.name}
                          as={Link}
                          to={item.href}
                          className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                        >
                          {item.name}
                        </Disclosure.Button>
                      ))}
                      <div className="px-3 py-2 text-xs font-semibold text-gray-400 border-b border-gray-600">
                        UTILISATEUR
                      </div>
                    </>
                  )}
                  {userNavigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as={Link}
                      to={item.href}
                      className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                  <Disclosure.Button
                    as="button"
                    onClick={logout}
                    className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                  >
                    Déconnexion
                  </Disclosure.Button>
                </div>
              </div>
            ) : (
              <div className="border-t border-gray-700 pb-3 pt-4">
                <div className="space-y-1 px-2">
                  <Disclosure.Button
                    as={Link}
                    to="/login"
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                  >
                    Connexion
                  </Disclosure.Button>
                  <Disclosure.Button
                    as={Link}
                    to="/register"
                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                  >
                    Inscription
                  </Disclosure.Button>
                </div>
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
} 