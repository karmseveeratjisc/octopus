import React from 'react';

import * as Interfaces from '@interfaces';
import * as Components from '@components';

type Props = {
    image: Interfaces.TextEditorImage;
    positiveActionCallback: (url: string) => void;
    negativeActionCallback: () => void;
};

const URLSourceUpload: React.FC<Props> = (props): React.ReactElement => {
    const [url, setUrl] = React.useState<null | string>(null);

    return (
        <section key="url-source" className="space-y-8">
            <input
                type="text"
                placeholder="Paste in your url to an image"
                onChange={(e) => setUrl(e.target.value)}
                value={url ?? ''}
                className="w-full rounded-md border-grey-100 px-4 py-3 text-sm text-grey-700 shadow placeholder:text-center placeholder:text-sm placeholder:text-grey-300"
            />

            <div className="mx-auto h-60 w-60">
                {!!url ? (
                    <Components.ImagePreview id="image-preview" source={url} showClose close={() => setUrl(null)} />
                ) : (
                    <Components.ImagePreview id="image-preview" showClose={false} close={() => setUrl(null)} />
                )}
            </div>

            <div className="mt-6 flex justify-between space-x-4">
                <Components.ModalButton
                    text="Cancel"
                    title="Cancel"
                    onClick={() => props.negativeActionCallback()}
                    actionType="NEGATIVE"
                />
                <Components.ModalButton
                    text="Upload image"
                    title="Upload image"
                    disabled={!url}
                    onClick={() => {
                        url && props.positiveActionCallback(url);
                    }}
                    actionType="POSITIVE"
                />
            </div>
        </section>
    );
};

export default URLSourceUpload;
