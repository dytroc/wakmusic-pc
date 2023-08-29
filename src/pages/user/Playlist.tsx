import { useEffect, useMemo, useState } from "react";
import { useQuery } from "react-query";
import { useLocation } from "react-router-dom";
import { styled } from "styled-components/macro";

import {
  editOrderOfPlaylist,
  editPlaylistName,
  fetchRecommendedPlaylist,
  fetchRecommendedPlaylistDetail,
  removeSongsFromPlaylist,
} from "@apis/playlist";
import { fetchPlaylists } from "@apis/user";

import { ReactComponent as EditTitle } from "@assets/icons/ic_24_edit_filled.svg";
import { ReactComponent as Share } from "@assets/icons/ic_24_export.svg";
import { ReactComponent as PlayAll } from "@assets/icons/ic_24_play_all.svg";
import { ReactComponent as RandomPlay } from "@assets/icons/ic_24_random_900.svg";

import { T3Medium, T6Light } from "@components/Typography";
import CustomSongs from "@components/globals/CustomSongs";
import GuideBar, { GuideBarFeature } from "@components/globals/GuideBar";
import IconButton from "@components/globals/IconButton";
import TextButton from "@components/globals/TextButton";
import MusicController from "@components/globals/musicControllers/MusicController";

import colors from "@constants/colors";

import { useCreateListModal } from "@hooks/createListModal";
import { usePlaySongs } from "@hooks/player";
import { usePrevious } from "@hooks/previous";
import { useSelectSongs } from "@hooks/selectSongs";
import { useShareListModal } from "@hooks/shareListModal";

import { BasePlaylist, PlaylistType } from "@templates/playlist";
import { Song } from "@templates/song";
import { SongItemFeature } from "@templates/songItem";

import { getPlaylistIcon, getRecommendSquareImage } from "@utils/staticUtill";
import { isSameArray } from "@utils/utils";

interface PlaylistProps {}

const Playlist = ({}: PlaylistProps) => {
  const openEditPlaylistNameModal = useCreateListModal();
  const shareListModal = useShareListModal();
  const playSongs = usePlaySongs();

  const { data: playlists, refetch } = useQuery({
    queryKey: "playlists",
    queryFn: fetchPlaylists,
  });

  const { data: recommendLists } = useQuery({
    queryKey: "recommendLists",
    queryFn: fetchRecommendedPlaylist,
    staleTime: Infinity,
  });

  const [isEditmode, setEditmode] = useState(false);
  const location = useLocation();
  const playlistId = useMemo(
    () => location.pathname.split("/")[2],
    [location.pathname]
  );

  const recommendKey: string | undefined = useMemo(
    () => recommendLists?.find((item) => item.key === playlistId)?.key,
    [recommendLists, playlistId]
  );

  const { data: recommendList } = useQuery({
    queryKey: ["recommendList", recommendKey],
    queryFn: async () => {
      if (!recommendKey) return null;

      return await fetchRecommendedPlaylistDetail(recommendKey);
    },
    staleTime: 24 * 60 * 60 * 1000,
  });

  const playlist: BasePlaylist | undefined = useMemo(() => {
    if (recommendList) return recommendList;
    return (playlists ?? []).find((item) => item.key === playlistId);
  }, [playlistId, playlists, recommendList]);

  const { selected, selectCallback, selectedIncludes } = useSelectSongs();

  const prevPlaylist = usePrevious(playlist);
  const [changePlaylist, setChangePlaylist] = useState<Song[]>([]);

  useEffect(() => {
    if (
      !playlist ||
      isEditmode ||
      changePlaylist.length === 0 ||
      !isSameArray(prevPlaylist?.songs ?? [], playlist?.songs ?? []) ||
      isSameArray(playlist?.songs ?? [], changePlaylist)
    ) {
      return;
    }

    (async () => {
      const ok = await editOrderOfPlaylist(
        playlist.key,
        changePlaylist.map((song) => song.songId)
      );

      if (ok) {
        refetch();
      }
    })();
  }, [changePlaylist, isEditmode, playlist, prevPlaylist?.songs, refetch]);

  const editPlaylistNameHandler = async () => {
    const name = await openEditPlaylistNameModal(playlist?.title);

    if (!name) return;

    const ok = await editPlaylistName(playlist?.key ?? "", name);

    if (ok) {
      refetch();
    }
  };

  const dispatchSongs = async (songs: Song[]) => {
    if (!playlist) return;

    const removedSongs = playlist.songs.filter(
      (plSong) => !songs.find((song) => song.songId === plSong.songId)
    );

    if (removedSongs.length > 0) {
      const ok = await removeSongsFromPlaylist(
        playlist.key,
        removedSongs.map((song) => song.songId)
      );

      if (ok) {
        refetch();
      }
    }

    setChangePlaylist(songs);
  };

  // TODO
  if (!playlist) return <div>loading...</div>;

  return (
    <Container>
      <Header>
        <Info>
          <Icon
            src={
              recommendList
                ? getRecommendSquareImage(recommendList)
                : getPlaylistIcon((playlist as PlaylistType).image)
            }
          />
          <Details>
            <Title>
              <T3Medium color={colors.gray700}>{playlist.title}</T3Medium>
              {isEditmode && <EditButton onClick={editPlaylistNameHandler} />}
            </Title>
            <T6Light color={colors.blueGray500}>
              {playlist.songs?.length}곡
            </T6Light>
            <Functions>
              <IconButton
                icon={PlayAll}
                onClick={() => playSongs(playlist.songs)}
              >
                전체재생
              </IconButton>

              <IconButton
                icon={RandomPlay}
                onClick={() => playSongs(playlist.songs, true)}
              >
                랜덤재생
              </IconButton>

              {!recommendList && (
                <ShareIcon
                  onClick={() => {
                    shareListModal(playlist.key);
                  }}
                />
              )}
            </Functions>
          </Details>
        </Info>
        {!recommendList && (
          <TextButton
            text={{ default: "편집", activated: "완료" }}
            activated={isEditmode}
            onClick={() => setEditmode(!isEditmode)}
          />
        )}
      </Header>

      <GuideBar
        features={[
          GuideBarFeature.info,
          GuideBarFeature.date,
          GuideBarFeature.views,
          GuideBarFeature.like,
        ]}
        editMode={isEditmode}
      />

      <CustomSongs
        height={281}
        editMode={isEditmode}
        onEdit={dispatchSongs}
        onSongClick={selectCallback}
        selectedIncludes={selectedIncludes}
        selectedSongs={selected}
        songFeatures={[
          SongItemFeature.date,
          SongItemFeature.views,
          SongItemFeature.like,
        ]}
      >
        {playlist.songs ?? []}
      </CustomSongs>

      <MusicController
        displayDefault={false}
        songs={playlist.songs ?? []}
        selectedSongs={selected}
        dispatchSelectedSongs={selectCallback}
        onDelete={isEditmode ? dispatchSongs : undefined}
      />
    </Container>
  );
};

const Container = styled.div`
  width: 754px;
  height: calc(100vh - 78px);

  margin: auto;
  margin-top: 20px;

  padding-top: 20px;

  border: 1px solid ${colors.blueGray25};
  border-radius: 16px;

  background-color: ${colors.white}66;
  backdrop-filter: blur(62.5px);

  overflow-y: hidden;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;

  margin-bottom: 1px;

  padding-left: 20px;
  padding-right: 28px;

  width: 100%;
`;

const Info = styled.div`
  display: flex;
`;

const Details = styled.div`
  margin-top: 12px;
  margin-left: 23px;
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  margin-bottom: 4px;
`;

const EditButton = styled(EditTitle)`
  cursor: pointer;
`;

const Functions = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;

  margin-top: 20px;
`;

const ShareIcon = styled(Share)`
  margin-left: 8px;

  cursor: pointer;
`;

const Icon = styled.img`
  width: 140px;
  height: 140px;

  border-radius: 12px;
`;

export default Playlist;
