import * as response from 'lib/response';
import * as bookmarkService from 'bookmark/service';
import * as publicationService from 'publication/service';
import * as I from 'interface';

export const create = async (
    event: I.AuthenticatedAPIRequest<undefined, undefined, I.CreateBookmarkPathParams>
): Promise<I.JSONResponse> => {
    try {
        const publication = await publicationService.get(event.pathParameters.id);

        //check that the publication exists
        if (!publication) {
            return response.json(404, {
                message: 'This publication does not exist.'
            });
        }

        //check that the publication is live
        if (publication.currentStatus === 'DRAFT') {
            return response.json(404, {
                message: 'You cannot bookmark a draft publication.'
            });
        }

        const bookmark = await bookmarkService.get(event.pathParameters.id, event.user.id);

        // check that the user hasn't already bookmarked this publication
        if (bookmark) {
            return response.json(404, {
                message: 'You have already bookmarked this publication.'
            });
        }

        // check to see if the user is the author or co author. if so throw an error
        const isUserCoAuthor = publication.coAuthors.some((user) => user.id == event.user.id);

        if (isUserCoAuthor || event.user.id === publication.user.id) {
            return response.json(404, {
                message: 'You cannot bookmark a publication you have authored or co-authored.'
            });
        }

        await bookmarkService.create(event.pathParameters.id, event.user.id);

        return response.json(200, { message: 'You have bookmarked this publication.' });
    } catch (err) {
        return response.json(500, { message: 'Unknown server error.' });
    }
};

export const remove = async (
    event: I.AuthenticatedAPIRequest<undefined, undefined, I.RemoveBookmarkPathParams>
): Promise<I.JSONResponse> => {
    try {
        const publication = await publicationService.get(event.pathParameters.id);

        //check that the publication exists
        if (!publication) {
            return response.json(404, {
                message: 'This publication does not exist.'
            });
        }

        //check that the publication is live
        if (publication.currentStatus === 'DRAFT') {
            return response.json(404, {
                message: 'You cannot bookmark a draft publication.'
            });
        }

        const bookmark = await bookmarkService.get(event.pathParameters.id, event.user.id);

        // check that the user has created the bookmark/ hasn't already deleted it
        if (!bookmark) {
            return response.json(404, {
                message: 'You have already deleted the bookmark for this publication.'
            });
        }

        await bookmarkService.remove(event.pathParameters.id, event.user.id);

        return response.json(200, { message: 'Co-author deleted from this publication' });
    } catch (err) {
        return response.json(500, { message: 'Unknown server error.' });
    }
};
