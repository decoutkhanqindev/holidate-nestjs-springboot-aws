import AccountSidebar from '@/components/Account/AccountSidebar';
import { ReactNode } from 'react';

export default function AccountLayout({ children }: { children: ReactNode }) {
    return (
        <main className="bg-light">
            <div className="container" style={{ paddingTop: '100px', paddingBottom: '40px' }}>
                <div className="row">
                    <div className="col-lg-3">
                        <AccountSidebar />
                    </div>

                    <div className="col-lg-9">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body p-4">
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}