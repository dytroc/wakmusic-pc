import { LyricType } from "@templates/player";
import { Song } from "@templates/song";

import instance from "../axios";

export const getLyrics = async (song: Song): Promise<LyricType[] | null> => {
  try {
    const { data } = await instance.get(`/v2/songs/lyrics/${song.songId}`);

    return data.map((lyric: LyricType) => ({
      ...lyric,
      start: lyric.start - song.start,
      end: lyric.end - song.start,
    }));
  } catch (err) {
    return null;
  }
};
