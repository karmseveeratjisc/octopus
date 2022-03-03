import Head from 'next/head';

import * as Components from '@components';
import * as Layouts from '@layouts';
import * as Config from '@config';
import * as Types from '@types';

const Privacy: Types.NextPage = (): JSX.Element => {
    return (
        <>
            <Head>
                <meta name="description" content={`${Config.urls.privacy.description}`} />
                <meta name="keywords" content={`${Config.urls.privacy.keywords}`} />
                <link rel="canonical" href={`${Config.urls.privacy.canonical}`} />
                <title>{Config.urls.privacy.title}</title>
            </Head>

            <Layouts.Standard fixedHeader={true}>
                <Components.SectionTwo
                    className="bg-teal-50 dark:bg-grey-800"
                    waveFillTop="fill-teal-100 dark:fill-grey-500 transition-colors duration-500"
                    waveFillMiddle="fill-teal-200 dark:fill-grey-600 transition-colors duration-500"
                    waveFillBottom="fill-teal-700 dark:fill-grey-800 transition-colors duration-500"
                >
                    <section className="container mx-auto px-8 pt-8 lg:gap-4 lg:pt-36">
                        <div className="mx-auto mb-10 grid grid-cols-1 gap-4 text-grey-900 dark:text-white lg:w-8/12">
                            <Components.PageTitle text="Privacy" />
                            <h2 className="mt-10 text-xl font-medium">Privacy</h2>
                            <p>
                                Jisc privacy notice -
                                <Components.Link
                                    openNew
                                    className="mb-6 rounded underline decoration-teal-500 underline-offset-2 outline-0 focus:ring-2 focus:ring-yellow-400"
                                    href="https://www.jisc.ac.uk/website/privacy-notice"
                                >
                                    <span>https://www.jisc.ac.uk/website/privacy-notice</span>
                                </Components.Link>
                            </p>
                            <p>
                                We&apos;ll use it, as described in our standard privacy notice (at
                                https://www.jisc.ac.uk/website/privacy-notice), to provide the service you&apos;ve
                                requested, as well as to identify problems or ways to make the service better. We will
                                retain the anonymised usage information indefinitely.
                            </p>
                            <h3>User accounts</h3>
                            <p>
                                The following information is needed for us to set up your Octopus account and
                                communicate with you as an Octopus user:
                            </p>
                            <ul className="list-disc">
                                <li>Name (via ORCID)</li>
                                <li>Affiliation (via ORCID)</li> <li>Current email address</li>
                            </ul>
                            <p>
                                Octopus accounts must be linked to an ORCID account (https://orcid.org/). When you
                                create an account on this service you are granting Octopus:
                            </p>
                            <ul className="list-disc">
                                <li>
                                    Access to your public ORCID information, such as name, affiliation(s), and
                                    publications.
                                </li>
                                <li>Permission to display this public information on your Octopus user account </li>
                                <li>
                                    Permission to update your ORCID public information to display any publications
                                    created on Octopus
                                </li>
                            </ul>
                            <p>
                                As well as data from ORCID, all user activity (such as submitted content, ratings, red
                                flags, and related publications), is stored by Jisc and will be displayed on your public
                                user profile.
                            </p>
                            <p>
                                We&apos;ll keep the information until we are told that you no longer wish to use the
                                service. If you wish to delete your Octopus user account, you can email help@jisc.ac.uk
                                and we will remove your individual account and personal information. However, please
                                note that unless otherwise agreed we would not as standard delete any publications
                                affiliated with this account.
                            </p>
                        </div>
                    </section>
                </Components.SectionTwo>
            </Layouts.Standard>
        </>
    );
};

export default Privacy;
