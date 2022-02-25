let host: string;
let orcidAppiID: string;

switch (process.env.NEXT_PUBLIC_ENV) {
    case 'local':
        host = 'https://localhost:3001';
        orcidAppiID = 'APP-57ZHSJRO55526ROC';
        break;
    case 'prod':
        host = 'https://octopus.ac';
        orcidAppiID = '';
        break;
    default:
        host = `https://${process.env.NEXT_PUBLIC_ENV}.octopus.ac`;
        orcidAppiID = '';
}

const base = {
    title: 'Octopus. Built for Scientists.',
    host
};

const urls = {
    // Search
    search: {
        path: '/search',
        title: `Search publications - ${base.title}`,
        description: '',
        keywords: '',
        canonical: `${base.host}/search`
    },

    // Publications
    createPublication: {
        path: '/create',
        title: `New Publication - ${base.title}`,
        description: '',
        keywords: '',
        canonical: `${base.host}/create`
    },
    viewPublication: {
        path: '/publications',
        title: `${base.title}`,
        canonical: `${base.host}/publications`
    },
    browsePublications: {
        path: '/browse',
        title: `Browse all publications - ${base.title}`,
        description: '',
        keywords: '',
        canonical: `${base.host}/browse`
    },
    editPublication: {
        path: '/edit',
        title: `Edit draft publication - ${base.title}`,
        description: '',
        keywords: '',
        canonical: `${base.host}/edit`
    },

    // Users
    viewUser: {
        path: '/authors',
        title: `${base.title}`,
        canonical: `${base.host}/authors`
    },

    // Static Pages
    home: {
        path: '/',
        title: `${base.title}`,
        description: "A new way to publish your scientific work that's fast, free and fair.",
        keywords: 'publish',
        canonical: `${base.host}`
    },
    legal: {
        path: '/legal',
        title: `Legal - ${base.title}`,
        description: '',
        keywords: '',
        canonical: `${base.host}/legal`
    },
    privacy: {
        path: '/privacy',
        title: `Privacy - ${base.title}`,
        description: '',
        keywords: '',
        canonical: `${base.host}/privacy`
    },
    about: {
        path: '/about',
        title: `About Octopus - ${base.title}`,
        description: 'More information about the Octopus platform.',
        keywords: 'about, octopus',
        canonical: `${base.host}/about`
    },
    faq: {
        path: '/faq',
        title: `Frequently Asked Questions - ${base.title}`,
        description: 'Frequently asked questions about the Octopus platform.',
        keywords: 'faq, octopus',
        canonical: `${base.host}/faq`
    },
    documentation: {
        path: '/documentation',
        title: `API documentation - ${base.title}`,
        description: '',
        keywords: '',
        canonical: `${base.host}/documentation`
    },
    accessibility: {
        path: '/accessibility',
        title: `Accessibility - ${base.title}`,
        description: '',
        keywords: '',
        canonical: `${base.host}/accessibility`
    },
    404: {
        title: `404 Not Found - ${base.title}`
    },
    500: {
        title: `Something went wrong - ${base.title}`
    },
    orcidLogin: {
        path: `https://orcid.org/oauth/authorize?client_id=${orcidAppiID}&response_type=code&scope=/authenticate&redirect_uri=${base.host}/callback`
    }
};

export default urls;
