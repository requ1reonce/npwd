import { FormattedTweet, UpdateProfileProps } from '@typings/twitter';
import { twitterState, useSetFilteredTweets, useSetTweets, useSetTwitterProfile } from './state';
import { useCallback } from 'react';
import { Snapshot, useRecoilCallback } from 'recoil';
import AddTweetModal from '../components/AddTweetModal';

interface TwitterActionProps {
  updateTweets: (tweets: FormattedTweet[]) => void;
  updateFilteredTweets: (tweets: FormattedTweet[]) => void;
  addTweet: (tweet: FormattedTweet) => void;
  deleteTweet: (tweetId: number) => void;
  updateLocalProfile: (profile: UpdateProfileProps) => void;
  localToggleLike: (tweetId: number) => void;
}

const getIsTweetsLoading = (snapshot: Snapshot) =>
  snapshot.getLoadable<FormattedTweet[]>(twitterState.tweets).state !== 'hasValue';

export const useTwitterActions = (): TwitterActionProps => {
  const setTweets = useSetTweets();
  const setFilteredTweets = useSetFilteredTweets();
  const setTwitterProfile = useSetTwitterProfile();

  const updateTweets = useRecoilCallback(
    ({ snapshot, set }) =>
      (tweet: FormattedTweet[]) => {
        const tweetsLoading = getIsTweetsLoading(snapshot);
        if (tweetsLoading) return;

        set(twitterState.tweets, (curVal) => [...curVal, ...tweet]);
      },
    [setTweets],
  );

  const updateLocalProfile = useCallback(
    (profile: UpdateProfileProps) => {
      setTwitterProfile((curVal) => ({
        ...curVal,
        profile_name: profile.profile_name,
        avatar_url: profile.avatar_url,
      }));
    },
    [setTwitterProfile],
  );

  const updateFilteredTweets = useCallback(
    (tweets: FormattedTweet[]) => {
      setFilteredTweets(tweets);
    },
    [setFilteredTweets],
  );

  const addTweet = useRecoilCallback(({ snapshot, set }) => async (tweet: FormattedTweet) => {
    const tweetsLoading = getIsTweetsLoading(snapshot);

    if (tweetsLoading) return;

    set(twitterState.tweets, (curVal) => [tweet, ...curVal]);
  });

  const deleteTweet = useRecoilCallback(
    ({ snapshot, set }) =>
      (tweetId: number) => {
        const tweetsLoading = getIsTweetsLoading(snapshot);

        if (tweetsLoading) return;

        set(twitterState.tweets, (curVal) => [...curVal].filter((t) => t.id !== tweetId));
      },
    [setTweets],
  );

  const localToggleLike = useCallback(
    (tweetId: number) => {
      setTweets((curVal) =>
        [...curVal].map((tweet) => {
          if (tweet.id === tweetId) {
            return {
              ...tweet,
              isLiked: tweet.isLiked ? false : true,
              likes: tweet.isLiked ? tweet.likes - 1 : tweet.likes + 1,
            };
          }
          return tweet;
        }),
      );
    },
    [setTweets],
  );

  return {
    updateTweets,
    updateFilteredTweets,
    addTweet,
    deleteTweet,
    updateLocalProfile,
    localToggleLike,
  };
};
