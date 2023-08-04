import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";

import { useInterval } from "@hooks/interval";
import {
  useControlState,
  useIsControllingState,
  useNextSong,
  usePlayingInfoState,
  usePlayingLengthState,
  usePlayingProgressChangeState,
  usePlayingProgressState,
  usePrevSong,
  useToggleIsPlayingState,
} from "@hooks/player";
import { usePrevious } from "@hooks/previous";

import { SongInfo } from "@templates/player";

import { applyHook } from "@utils/consoleApi";
import { getYoutubeHQThumbnail } from "@utils/staticUtill";

interface YoutubeProps {}

const Youtube = ({}: YoutubeProps) => {
  const [controlState, setControlState] = useControlState();
  const [playingLength, setPlayingLength] = usePlayingLengthState();
  const [playingProgress, setPlayingProgress] = usePlayingProgressState();
  const [changeProgress] = usePlayingProgressChangeState();
  const [playingInfo, setPlayingInfo] = usePlayingInfoState();
  const [isControlling] = useIsControllingState();

  const [nowPlaying, setNowPlaying] = useState<SongInfo | null>(null);
  const [loaded, setLoaded] = useState(false);

  const prevSongId = usePrevious(nowPlaying?.songId);
  const prevChangeProgress = usePrevious(changeProgress);

  const toggleIsPlayingState = useToggleIsPlayingState();
  const prevSong = usePrevSong();
  const nextSong = useNextSong();

  const player = useRef<YT.Player>();
  const playerState = useRef<{
    current: SongInfo | null;
    loaded: boolean;
  }>({
    current: null,
    loaded: false,
  });

  applyHook(setPlayingInfo);

  // 괴랄한 유튜브 iframe api를 사용하기 위한 꼼수
  useEffect(() => {
    setNowPlaying(playingInfo.playlist[playingInfo.current]);
    playerState.current.current = playingInfo.playlist[playingInfo.current];
    playerState.current.loaded = loaded;
  }, [playingInfo, loaded]);

  const onStateChange = useCallback(
    (e: YT.OnStateChangeEvent) => {
      if (e.data === YT.PlayerState.UNSTARTED) {
        player.current?.playVideo();
      }

      if (e.data === YT.PlayerState.PLAYING) {
        if (!playerState.current.loaded && playerState.current.current) {
          const current = playerState.current.current;
          const videoDuration = Math.round(
            (
              e.target as unknown as {
                playerInfo: { duration: number };
              }
            ).playerInfo.duration
          );

          const duration =
            (current.end === 0 ? videoDuration : current.end) - current.start;

          const iframe = e.target.getIframe() as HTMLIFrameElement;

          // 그냥 넣으면 안먹힘
          setTimeout(() => {
            if (iframe.contentWindow) {
              const mediaSession = iframe.contentWindow.navigator.mediaSession;

              mediaSession.metadata = new MediaMetadata({
                title: current.title,
                artist: current.artist,
                artwork: [
                  {
                    src: getYoutubeHQThumbnail(current.songId),
                    sizes: "480x360",
                    type: "image/jpg",
                  },
                ],
              });

              mediaSession.setActionHandler("nexttrack", () => nextSong());
              mediaSession.setActionHandler("previoustrack", () => prevSong());

              mediaSession.setActionHandler("play", () =>
                toggleIsPlayingState()
              );

              mediaSession.setActionHandler("pause", () =>
                toggleIsPlayingState()
              );
            }
          }, 500);

          setPlayingLength(Math.round(duration));
          setPlayingProgress(0);
          setLoaded(true);
        }

        setControlState((prev) => ({ ...prev, isPlaying: true }));
      }

      if (e.data === YT.PlayerState.PAUSED) {
        setControlState((prev) => ({ ...prev, isPlaying: false }));
      }
    },
    [setControlState, setPlayingLength, setPlayingProgress]
  );

  // 유튜브 플레이어 생성
  useEffect(() => {
    const _player = new YT.Player("wakmu-youtube", {
      events: {
        onReady: (e) => {
          player.current = e.target;
        },
        onStateChange: onStateChange,
      },
    });

    return () => {
      _player.destroy();
    };
  }, [onStateChange]);

  // 영상 재생
  useEffect(() => {
    if (!nowPlaying || !player.current || prevSongId === nowPlaying.songId)
      return;

    setLoaded(false);

    player.current.loadVideoById(nowPlaying.songId, nowPlaying.start);
  }, [nowPlaying, prevSongId]);

  // 영상 재생 위치 변경
  useInterval(() => {
    if (isControlling) return;
    if (!controlState.isPlaying) return;

    if (playingProgress >= playingLength) {
      if (player.current) {
        player.current.stopVideo();
      }

      nextSong();

      return;
    }

    setPlayingProgress(playingProgress + 1);
  }, 1000);

  // changeProgress 변경 시 영상 재생 위치 변경
  useEffect(() => {
    const nowPlaying = playerState.current.current;

    if (
      (changeProgress !== 0 && changeProgress !== prevChangeProgress) ||
      !nowPlaying ||
      !player.current ||
      isControlling
    )
      return;

    player.current.seekTo(changeProgress + nowPlaying.start, true);
    setPlayingProgress(changeProgress);
  }, [changeProgress, isControlling, setPlayingProgress]);

  // 재생 컨트롤
  useEffect(() => {
    if (!player.current) return;

    if (controlState.isPlaying) {
      player.current.playVideo();

      return;
    }

    player.current.pauseVideo();
  }, [controlState.isPlaying, nowPlaying]);

  // 볼륨 컨트롤
  useEffect(() => {
    if (!player.current) return;

    player.current.setVolume(controlState.volume);
  }, [controlState.volume]);

  return <Container id="wakmu-youtube" />;
};

const Container = styled.div``;

export default Youtube;
