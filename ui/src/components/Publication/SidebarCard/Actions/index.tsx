import React from 'react';
import * as SWR from 'swr';
import Image from 'next/image';
import * as Router from 'next/router';
import * as ReactRange from 'react-range';
import * as SolidIcons from '@heroicons/react/solid';
import * as OutlineIcons from '@heroicons/react/outline';

import * as Interfaces from '@interfaces';
import * as Components from '@components';
import * as Helpers from '@helpers';
import * as Stores from '@stores';
import * as Config from '@config';
import * as Assets from '@assets';
import * as api from '@api';

type RatingSelectorProps = {
    title: string;
    description: string;
    labels: {
        negative: string;
        positive: string;
    };
    value: number | null | undefined;
    callback: (value: number) => void;
    disabled: boolean;
};

const RatingSelector: React.FC<RatingSelectorProps> = (props): React.ReactElement => (
    <div>
        <div className="flex items-center justify-between space-x-4">
            <p
                className="mb-1 flex items-center text-left font-montserrat font-medium text-grey-700"
                title={props.description}
            >
                {props.title}{' '}
                <OutlineIcons.InformationCircleIcon className="ml-2 block w-5 text-teal-600 hover:cursor-pointer lg:hidden" />
            </p>
            <span className="col-span-1 text-xs font-medium text-grey-700">
                {props.value || props.value === 0 ? `${props.value}/10` : 'N/A'}
            </span>
        </div>
        <p className="mb-3 hidden w-11/12 text-left font-montserrat text-xs font-medium text-grey-700 lg:block">
            {props.description}
        </p>
        <div className="mb-12 items-start">
            <ReactRange.Range
                step={1}
                min={0}
                max={10}
                disabled={props.disabled}
                values={props.value || props.value === 0 ? [props.value] : [5]}
                onChange={(values) => props.callback(values[0])}
                renderMark={({ props: markProps, index }) => (
                    <div
                        {...markProps}
                        style={{ ...markProps.style }}
                        className={`relative -bottom-2 h-4 w-0.5 pb-2 transition-colors duration-500 ${
                            props.value || props.value === 0 ? 'bg-teal-200' : 'bg-grey-100'
                        }`}
                    >
                        <div
                            className={`absolute -bottom-6 w-max text-xxs text-grey-800 ${
                                index === 0 ? '-left-full' : ''
                            } ${index === 10 ? '-right-[5px] left-auto' : ''}`}
                        >
                            {index !== 0 && index !== 10 && index}
                            {(index === 0 && (
                                <>
                                    {index}
                                    <span title={props.labels.negative} className="absolute -left-1 flex items-end">
                                        <SolidIcons.InformationCircleIcon className="mr-1 w-4 text-teal-600" />
                                    </span>
                                </>
                            )) ||
                                (index === 10 && (
                                    <>
                                        {index}
                                        <span title={props.labels.positive} className="absolute -left-1 flex items-end">
                                            <SolidIcons.InformationCircleIcon className="ml-1 w-4 text-teal-600" />
                                        </span>
                                    </>
                                ))}
                        </div>
                    </div>
                )}
                renderTrack={({ props: trackProps, children }) => (
                    <div
                        {...trackProps}
                        style={{ ...trackProps.style }}
                        className={`h-2 w-full rounded-sm transition-colors duration-500 
                            ${props.value || props.value === 0 ? 'bg-teal-200' : 'bg-grey-100'} ${
                            props.disabled ? 'opacity-50' : ''
                        }`}
                    >
                        {children}
                    </div>
                )}
                renderThumb={({ props: rangeProps }) => (
                    <div
                        {...rangeProps}
                        style={{ ...rangeProps.style }}
                        className={`relative h-4 w-4 rounded-full border-transparent outline-0 transition-colors duration-500 focus:ring-2 focus:ring-yellow-400 ${
                            props.value || props.value === 0 ? 'bg-teal-600' : 'bg-grey-300'
                        }`}
                    />
                )}
            />
        </div>
    </div>
);

type ActionProps = {
    publication: Interfaces.Publication;
};

const Actions: React.FC<ActionProps> = (props): React.ReactElement => {
    const router = Router.useRouter();
    const SWRConfig = SWR.useSWRConfig();
    const user = Stores.useAuthStore((state) => state.user);
    const setToast = Stores.useToastStore((state) => state.setToast);
    const [showModel, setShowModel] = React.useState(false);

    // Computed value of the first rating
    const originalFirstRating = React.useMemo(
        () =>
            props.publication.ratings.aggregate.find(
                (rating) =>
                    rating.category ===
                    Config.values.octopusInformation.publications[props.publication.type].ratings[0].id
            )?._avg.rating,
        [props.publication]
    );

    // Computed value of the second rating
    const originalSecondRating = React.useMemo(
        () =>
            props.publication.ratings.aggregate.find(
                (rating) =>
                    rating.category ===
                    Config.values.octopusInformation.publications[props.publication.type].ratings[1].id
            )?._avg.rating,
        [props.publication]
    );

    // Computed value of the third rating
    const originalThirdRating = React.useMemo(
        () =>
            props.publication.ratings.aggregate.find(
                (rating) =>
                    rating.category ===
                    Config.values.octopusInformation.publications[props.publication.type].ratings[2].id
            )?._avg.rating,
        [props.publication]
    );

    // State that represents the current range sliders
    const [firstRatingValue, setFirstRatingValue] = React.useState<number | undefined | null>();
    const [secondRatingValue, setSecondRatingValue] = React.useState<number | undefined | null>();
    const [thirdRatingValue, setThirdRatingValue] = React.useState<number | undefined | null>();

    // Misc state
    const [error, setError] = React.useState<string | undefined>();
    const [submitting, setSubmitting] = React.useState(false);

    // When the publication from ssr changes, set the range slider state to the computed values.
    // This is important because moving between publications is not a page refresh, but nexts re-generates the ssr props
    // which tells us that the publicaiton has changed, there fore the computed values will have changed, so re set
    // the range slider states.
    React.useEffect(() => {
        setFirstRatingValue(originalFirstRating);
        setSecondRatingValue(originalSecondRating);
        setThirdRatingValue(originalThirdRating);
    }, [originalFirstRating, originalSecondRating, originalThirdRating]);

    const save = async () => {
        setSubmitting(true);
        try {
            // Only post new first rating value if it is truthy && does not match it's original value
            if (
                (firstRatingValue && firstRatingValue !== originalFirstRating) ||
                (firstRatingValue === 0 && firstRatingValue !== originalFirstRating)
            ) {
                await api.post(
                    `${Config.endpoints.publications}/${props.publication.id}/ratings`,
                    {
                        type: Config.values.octopusInformation.publications[props.publication.type].ratings[0].id,
                        value: firstRatingValue
                    },
                    user?.token
                );
            }

            // Only post new second rating value if it is truthy && does not match it's original value
            if (
                (secondRatingValue && secondRatingValue !== originalSecondRating) ||
                (secondRatingValue === 0 && secondRatingValue !== originalSecondRating)
            ) {
                await api.post(
                    `${Config.endpoints.publications}/${props.publication.id}/ratings`,
                    {
                        type: Config.values.octopusInformation.publications[props.publication.type].ratings[1].id,
                        value: secondRatingValue
                    },
                    user?.token
                );
            }

            // Only post new third rating value if it is truthy && does not match it's original value
            if (
                (thirdRatingValue && thirdRatingValue !== originalThirdRating) ||
                (thirdRatingValue === 0 && thirdRatingValue !== originalThirdRating)
            ) {
                await api.post(
                    `${Config.endpoints.publications}/${props.publication.id}/ratings`,
                    {
                        type: Config.values.octopusInformation.publications[props.publication.type].ratings[2].id,
                        value: thirdRatingValue
                    },
                    user?.token
                );
            }

            // Tell SWR that we have possibly posted some data, i.e mutated a route, so revalidate
            SWRConfig.mutate(`${Config.endpoints.publications}/${props.publication.id}`);

            // Close the model
            setShowModel(false);

            // Mount a new toast for successful response
            setToast({
                visible: true,
                dismiss: true,
                title: 'Ratings saved',
                icon: <OutlineIcons.CheckCircleIcon className="h-6 w-6 text-teal-400" aria-hidden="true" />,
                message: 'Your ratings have now been saved, you can re rate this publication at any time.'
            });
        } catch (err) {
            const { message } = err as Interfaces.JSONResponseError;
            setError(message);
        }

        setSubmitting(false);
    };

    return (
        <>
            <Components.Modal
                open={showModel}
                setOpen={setShowModel}
                positiveActionCallback={save}
                positiveButtonText="Submit my rating"
                cancelButtonText="Cancel"
                title={`Rate this ${Config.values.octopusInformation.publications[props.publication.type].heading}`}
                disableButtons={submitting}
            >
                <>
                    {!!submitting && (
                        <Assets.Spinner width={25} height={25} className="absolute top-5 right-5 stroke-teal-500" />
                    )}
                    <p className="mt-4 mb-8 text-xs text-grey-700">
                        Once you have read this publication, please help other readers by rating it.{' '}
                        <br className="hidden xl:block" />
                        The categories for rating have been chosen to reward good work:
                    </p>
                    <div className="mb-20">
                        {!!error && <Components.Alert severity="ERROR" title={error} className="my-4 text-left" />}
                        <div className="space-y-16">
                            <RatingSelector
                                title={
                                    Config.values.octopusInformation.publications[props.publication.type].ratings[0]
                                        .value
                                }
                                description={
                                    Config.values.octopusInformation.publications[props.publication.type].ratings[0]
                                        .description
                                }
                                labels={
                                    Config.values.octopusInformation.publications[props.publication.type].ratings[0]
                                        .labels
                                }
                                value={firstRatingValue}
                                callback={setFirstRatingValue}
                                disabled={submitting}
                            />
                            <RatingSelector
                                title={
                                    Config.values.octopusInformation.publications[props.publication.type].ratings[1]
                                        .value
                                }
                                description={
                                    Config.values.octopusInformation.publications[props.publication.type].ratings[1]
                                        .description
                                }
                                labels={
                                    Config.values.octopusInformation.publications[props.publication.type].ratings[1]
                                        .labels
                                }
                                value={secondRatingValue}
                                callback={setSecondRatingValue}
                                disabled={submitting}
                            />
                            <RatingSelector
                                title={
                                    Config.values.octopusInformation.publications[props.publication.type].ratings[2]
                                        .value
                                }
                                description={
                                    Config.values.octopusInformation.publications[props.publication.type].ratings[2]
                                        .description
                                }
                                labels={
                                    Config.values.octopusInformation.publications[props.publication.type].ratings[2]
                                        .labels
                                }
                                value={thirdRatingValue}
                                callback={setThirdRatingValue}
                                disabled={submitting}
                            />
                        </div>
                    </div>
                    <p className="block text-xs text-grey-600">
                        All your ratings are stored against your username in order to detect any `gaming` of the system.
                        Receiving money, favours or services in return for rating a publication is a matter of
                        scientific misconduct and could result in action being taken.
                    </p>
                </>
            </Components.Modal>

            <Components.SectioBreak name="Actions" />

            {/** Download options */}
            <div className="flex">
                <span className="mr-2 text-sm font-semibold text-grey-800 transition-colors duration-500 dark:text-grey-50">
                    Download:
                </span>
                <button
                    aria-label="Print button"
                    onClick={() => window.print()}
                    className="mr-4 flex items-center rounded border-transparent text-right text-sm font-medium text-teal-600 outline-0 transition-colors duration-500 hover:underline focus:overflow-hidden focus:ring-2 focus:ring-yellow-400 dark:text-teal-400"
                >
                    <Image src="/images/pdf.svg" alt="PDF Icon" width={18} height={18} />
                    <span className="ml-1">pdf</span>
                </button>
                <button
                    aria-label="Download JSON"
                    onClick={() =>
                        Helpers.blobFileDownload(
                            `${Config.endpoints.publications}/${props.publication.id}`,
                            `${props.publication.id}.json`
                        )
                    }
                    className="mr-4 flex items-center rounded border-transparent text-right text-sm font-medium text-teal-600 outline-0 transition-colors duration-500 hover:underline focus:overflow-hidden focus:ring-2 focus:ring-yellow-400 dark:text-teal-400"
                >
                    <Image src="/images/json.svg" alt="PDF Icon" width={18} height={18} />
                    <span className="ml-1">json</span>
                </button>
            </div>

            {user ? (
                <>
                    <button
                        aria-label="Write review button"
                        onClick={() => {
                            router.push({
                                pathname: `${Config.urls.createPublication.path}`,
                                query: {
                                    for: props.publication.id,
                                    type: 'PEER_REVIEW'
                                }
                            });
                        }}
                        className="flex items-center rounded border-transparent text-sm font-medium text-teal-600 outline-0 transition-colors duration-500 hover:underline focus:overflow-hidden focus:ring-2 focus:ring-yellow-400 dark:text-teal-400"
                    >
                        Write a review
                    </button>
                    <button
                        aria-label="Rate this publication"
                        onClick={() => setShowModel(true)}
                        className="flex items-center rounded border-transparent text-sm font-medium text-teal-600 outline-0 transition-colors duration-500 hover:underline focus:overflow-hidden focus:ring-2 focus:ring-yellow-400 dark:text-teal-400"
                    >
                        Rate this publication
                    </button>
                </>
            ) : (
                <>
                    <Components.Link
                        href={Config.urls.orcidLogin.path}
                        className="flex items-center rounded border-transparent text-sm font-medium text-teal-600 outline-0 transition-colors duration-500 hover:underline focus:overflow-hidden focus:ring-2 focus:ring-yellow-400 dark:text-teal-400"
                    >
                        Sign in to rate & review
                    </Components.Link>
                </>
            )}
        </>
    );
};

export default Actions;
