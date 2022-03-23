import React from 'react';

import * as Components from '@components';
import * as Config from '@config';
import * as Assets from '@assets';

const LogIn: React.FC = (): React.ReactElement => (
    <Components.Link
        href={Config.urls.orcidLogin.path}
        ariaLabel="Sign in with ORCID"
        className="flex items-center rounded-md bg-orcid p-1 lg:mr-4 lg:p-2"
    >
        <Assets.ORCID width={20} height={20} className="fill-white-50" />
        <span className="ml-2 hidden text-xs text-white-50 lg:block">Sign in with ORCID</span>
    </Components.Link>
);

export default LogIn;
