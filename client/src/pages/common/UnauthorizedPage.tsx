import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

export const UnauthorizedPage: React.FC = () => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <section className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">403</CardTitle>
            <CardDescription className="text-xl">Unauthorized Access</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              You don't have permission to access this page. Please contact your administrator if you believe this is an error.
            </p>
            <nav className="space-x-4">
              <Button asChild>
                <Link to="/">Go Home</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/login">Login</Link>
              </Button>
            </nav>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};