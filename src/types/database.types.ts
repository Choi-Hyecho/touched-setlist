export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string | null;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      schedule_types: {
        Row: {
          id: number;
          type_name: string;
          icon: string | null;
          created_at: string;
        };
      };
      schedules: {
        Row: {
          id: string;
          title: string;
          titleeng: string | null;
          description: string | null;
          performancedate: string;
          venue: string;
          city: string | null;
          schedule_type_id: number | null;
          posterurl: string | null;
          remarks: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      albums: {
        Row: {
          id: string;
          title: string;
          albumtype: string | null;
          releasedate: string | null;
          albumarturl: string | null;
          spotifyurl: string | null;
          melonurl: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      songs: {
        Row: {
          id: string;
          title: string;
          artist: string;
          album_id: string | null;
          youtubeurl: string | null;
          spotifyurl: string | null;
          applemusicurl: string | null;
          melonurl: string | null;
          genieurl: string | null;
          bugsurl: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      setlists: {
        Row: {
          id: string;
          schedule_id: string;
          song_id: string;
          order: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      song_stats: {
        Row: {
          id: string;
          song_id: string;
          year: number;
          playcount: number;
          totalperformances: number;
          updated_at: string;
        };
      };
    };
  };
}

// ============================================
// 편의용 타입
// ============================================

export type AlbumRow    = Database['public']['Tables']['albums']['Row'];
export type SongRow     = Database['public']['Tables']['songs']['Row'];
export type ScheduleRow = Database['public']['Tables']['schedules']['Row'];
export type SetlistRow  = Database['public']['Tables']['setlists']['Row'];
export type SongStatRow = Database['public']['Tables']['song_stats']['Row'];
export type ScheduleTypeRow = Database['public']['Tables']['schedule_types']['Row'];

export interface Album extends AlbumRow {}

export interface Song extends SongRow {
  albums?: Album | null;
}

export interface Schedule extends ScheduleRow {
  schedule_types?: { type_name: string; icon: string | null } | null;
  setlists?: Setlist[];
}

export interface Setlist extends SetlistRow {
  songs?: Song | null;
}

export interface ScheduleType extends ScheduleTypeRow {}
export interface SongStat extends SongStatRow {}
export type User = Database['public']['Tables']['users']['Row'];
