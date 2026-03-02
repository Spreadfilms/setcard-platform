export interface Actor {
  id: string
  created_at: string
  updated_at: string

  // Persönliche Daten
  first_name: string
  last_name: string
  email: string
  phone?: string
  date_of_birth?: string
  gender?: 'männlich' | 'weiblich' | 'divers'
  nationality?: string
  city?: string

  // Körperliche Merkmale
  height_cm?: number
  weight_kg?: number
  hair_color?: string
  eye_color?: string
  skin_type?: string
  body_type?: 'schlank' | 'sportlich' | 'normal' | 'kräftig'
  clothing_size_top?: string
  clothing_size_bottom?: string
  shoe_size?: number

  // Schauspiel-Daten
  experience_level?: 'Anfänger' | 'Fortgeschritten' | 'Profi'
  acting_skills?: string[]
  languages?: LanguageEntry[]
  dialects?: string[]
  special_skills?: string[]
  sports?: string[]
  music_skills?: string[]
  drivers_license?: string[]

  // Agentur
  agency_name?: string
  agency_contact?: string

  // Freitext
  about_me?: string
  showreel_url?: string

  // Verwaltung (nur Admin)
  status?: 'neu' | 'abgelehnt' | 'onhold' | 'pool'
  cast_priority?: 'A' | 'B' | 'C' | null
  admin_notes?: string

  // Zugang
  pin_hash?: string
  pin_expires_at?: string
  share_hash?: string

  // Medien
  portrait_photo_url?: string
  halfbody_photo_url?: string
  fullbody_photo_url?: string
  additional_photos?: string[]
  video_urls?: string[]
}

export interface LanguageEntry {
  language: string
  level: 'Muttersprache' | 'Fließend' | 'Gut' | 'Grundkenntnisse'
}

export interface EmailLog {
  id: string
  created_at: string
  actor_id: string
  subject: string
  body: string
  type: 'pin' | 'absage' | 'anfrage' | 'info' | 'custom'
  sent_by: string
}

export type ActorStatus = 'neu' | 'abgelehnt' | 'onhold' | 'pool'
export type CastPriority = 'A' | 'B' | 'C' | null

export interface FormStep {
  title: string
  description: string
}

// Form-Typen für Multi-Step Formular
export interface PersonalDataForm {
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth: string
  gender: string
  nationality: string
  city: string
}

export interface PhysicalDataForm {
  height_cm: number | ''
  weight_kg: number | ''
  hair_color: string
  eye_color: string
  skin_type: string
  body_type: string
  clothing_size_top: string
  clothing_size_bottom: string
  shoe_size: number | ''
}

export interface SkillsDataForm {
  experience_level: string
  acting_skills: string[]
  languages: LanguageEntry[]
  dialects: string[]
  special_skills: string[]
  sports: string[]
  music_skills: string[]
  drivers_license: string[]
}

export interface MediaDataForm {
  portrait_photo_url: string
  halfbody_photo_url: string
  fullbody_photo_url: string
  additional_photos: string[]
  video_urls: string[]
  showreel_url: string
}

export interface AboutDataForm {
  about_me: string
  agency_name: string
  agency_contact: string
}

export interface ActorFormData {
  personal: PersonalDataForm
  physical: PhysicalDataForm
  skills: SkillsDataForm
  media: MediaDataForm
  about: AboutDataForm
}
