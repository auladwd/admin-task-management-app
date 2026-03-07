'use client';

import Link from 'next/link';
import { FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-error/10 p-4">
              <FiAlertTriangle className="w-16 h-16 text-error" />
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
          <p className="text-base-content/70 mb-6">
            You don't have permission to access this page. Please contact your
            administrator if you believe this is an error.
          </p>

          <div className="card-actions justify-center">
            <Link href="/dashboard" className="btn btn-primary">
              <FiArrowLeft className="mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
