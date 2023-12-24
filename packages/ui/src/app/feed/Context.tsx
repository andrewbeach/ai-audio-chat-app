'use client';

import axios from 'axios';
import { createContext, useContext } from 'react';

type FeedContextType = {
  uploadFile: (file: File, signedUrl: string) => Promise<boolean>;
};

export const FeedContext = createContext<FeedContextType | undefined>(undefined);

type ProviderProps = {
  children: React.ReactNode;
};

// This context exposes effects and coeffects to components in the feed
// in a way that allows client components to use them without having to
// worry about the hierarchy of client and server components.
//
// Currently the only effect is the uploadFile effect, since Apollo Server
// hooks are used for other data needs. However, those could be moved here
// here, or a store with pure dispatchers could be used here instead.
export const FeedProvider = ({ children }: ProviderProps) => {
  const uploadFile = async (file: File, signedUrl: string) => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const cancelToken = source.token;

    const response = await axios
      .put(signedUrl, file, {
        headers: {
          'Content-Type': file.type,
          'Content-Disposition': `attachment; filename=${JSON.stringify(encodeURI(file.name))}`,
        },
        onUploadProgress: event => {
          const progress = event.total ? event.loaded / event.total : 0;
          // biased progress for a better ui representation of the action,
          // starting at 10 and giving 80 percent of the progress to this
          // put request. 
          const biasedProgress = 10 + 80 * progress;
          // Not used currently, but this data could be saved in a 
          // useState hook here and accessed in children components
          // to display the file upload progress.
          // setFileProgress(biasedProgress);
          // 
          // If progress isn't desired, a fetch request could be used 
          // instead.
          console.log({ biasedProgress });
        },
        cancelToken,
      })
      .catch(error => {
        if (axios.isCancel(error)) {
          return false;
        }
        // uploadFailed(error);
      });

    return true;
  };

  return (
    <FeedContext.Provider value={{
      uploadFile,
    }}>
      {children}
    </FeedContext.Provider>
  );
};

// Any client component can use this as long as it is below the tree
// of the provider node. An error will be thrown if the hook is used in 
// a component that is not below the provider in the tree.
export const useFeedContext = () => {
  const context = useContext(FeedContext)
  if (context === undefined) {
    throw new Error("useFeedContext must be within FeedProvider")
  }

  return context;
}
