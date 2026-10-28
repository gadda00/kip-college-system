'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  BadgeCheck,
  Building2,
  CalendarCheck2,
  Edit3,
  GraduationCap,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
  UserSquare2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QueryBoundary } from '@/components/kip/components/loading'
import { api, patch, post } from '@/components/kip/lib/api'
import { fmtDate } from '@/components/kip/lib/format'
import { navigate } from '@/components/kip/lib/router'
import { useAuthStore } from '@/components/kip/stores/auth-store'
import { RowsSkeleton, ViewHeading, initialsOf } from '@/components/kip/portal/shared'
import type { StudentProfileFull } from '@/components/kip/portal/types'

const KE_PHONE = /^(?:\+?254|0)\d{9}$/

export function ProfileView() {
  const { data, status, error, refetch } = useQuery<StudentProfileFull>({
    queryKey: ['student-profile'],
    queryFn: () => api<StudentProfileFull>('/api/student/profile'),
  })

  return (
    <QueryBoundary
      status={status}
      error={error}
      onRetry={() => void refetch()}
      skeleton={<RowsSkeleton rows={4} />}
    >
      {data && <ProfileBody profile={data} />}
    </QueryBoundary>
  )
}

function ProfileBody({ profile }: { profile: StudentProfileFull }) {
  const queryClient = useQueryClient()
  const refreshSession = useAuthStore((s) => s.refresh)

  const [editOpen, setEditOpen] = useState(false)
  const [phone, setPhone] = useState(profile.phone ?? '')
  const [address, setAddress] = useState(profile.address ?? '')
  const [editError, setEditError] = useState<string | null>(null)

  /** Close + reset the edit form (event-driven, not an effect). */
  const closeEdit = (next?: { phone?: string | null; address?: string | null }) => {
    setEditOpen(false)
    setPhone(next?.phone ?? profile.phone ?? '')
    setAddress(next?.address ?? profile.address ?? '')
    setEditError(null)
  }

  const handleEditOpenChange = (next: boolean) => {
    if (next) {
      setEditOpen(true)
    } else {
      closeEdit()
    }
  }

  const saveProfile = useMutation({
    mutationFn: () =>
      patch<{ updated: boolean; profile: StudentProfileFull }>('/api/student/profile', {
        phone: phone.trim(),
        address: address.trim(),
      }),
    onSuccess: (res) => {
      closeEdit({ phone: res.profile.phone, address: res.profile.address })
      toast.success('Profile updated', {
        description: 'Your contact details have been saved.',
      })
      void queryClient.invalidateQueries({ queryKey: ['student-profile'] })
      void refreshSession()
    },
    onError: (err) => {
      setEditError(err instanceof Error ? err.message : 'Could not save — please try again.')
    },
  })

  const handleSave = () => {
    const p = phone.replace(/\s+/g, '')
    if (p && !KE_PHONE.test(p)) {
      setEditError('Enter a valid Kenyan phone number e.g. +254 703 710 879.')
      return
    }
    if (address.length > 160) {
      setEditError('Address is too long (max 160 characters).')
      return
    }
    setEditError(null)
    saveProfile.mutate()
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <ViewHeading title="Profile" description="Your personal, academic and contact details." />
      </motion.div>

      {/* Identity card */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        aria-labelledby="profile-card"
      >
        <Card className="relative rule-top-gold bg-gradient-to-br from-brand-50/70 via-card to-card dark:from-brand-100/15 dark:via-card dark:to-card">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <span
                  aria-hidden="true"
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-700 text-xl font-bold text-[#f2efe6] ring-2 ring-gold-400/60 ring-offset-2 ring-offset-background"
                >
                  {initialsOf(profile.name)}
                </span>
                <div className="min-w-0">
                  <h2 id="profile-card" className="font-display text-lg font-bold sm:text-xl">
                    {profile.name}
                  </h2>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    {profile.admissionNo}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge className="gap-1 text-[10px]">
                      <GraduationCap className="h-3 w-3" aria-hidden="true" />
                      Student
                    </Badge>
                    <Badge
                      variant={profile.status === 'ACTIVE' ? 'secondary' : 'destructive'}
                      className="text-[10px]"
                    >
                      {profile.status === 'ACTIVE' ? 'Active' : profile.status}
                    </Badge>
                    {profile.gender && (
                      <Badge variant="outline" className="text-[10px]">
                        {profile.gender === 'MALE' ? 'Male' : 'Female'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Dialog open={editOpen} onOpenChange={handleEditOpenChange}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="focus-glow min-h-11">
                    <Edit3 className="mr-2 h-4 w-4" aria-hidden="true" />
                    Edit contacts
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Edit contact details</DialogTitle>
                    <DialogDescription>
                      Keep your phone number and postal address up to date so the college can reach
                      you.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-phone">Phone number</Label>
                      <Input
                        id="edit-phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="+254 703 710 879"
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value)
                          setEditError(null)
                        }}
                        className="h-11"
                        aria-invalid={Boolean(editError)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-address">Postal address</Label>
                      <Input
                        id="edit-address"
                        type="text"
                        autoComplete="street-address"
                        placeholder="P.O. Box 123, Kitui"
                        value={address}
                        onChange={(e) => {
                          setAddress(e.target.value)
                          setEditError(null)
                        }}
                        className="h-11"
                        aria-invalid={Boolean(editError)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Current: {profile.address ?? 'not provided'}
                      </p>
                    </div>
                    {editError && (
                      <p role="alert" className="text-sm font-medium text-destructive">
                        {editError}
                      </p>
                    )}
                  </div>
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => closeEdit()} className="min-h-11">
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saveProfile.isPending} className="min-h-11">
                      {saveProfile.isPending ? 'Saving…' : 'Save changes'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Info grid */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.1 }}
        aria-label="Detailed information"
      >
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserSquare2 className="h-4 w-4 text-gold-600 dark:text-gold-400" aria-hidden="true" />
              Detailed information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
              <InfoRow icon={Mail} label="Email address" value={profile.email} mono={false} />
              <InfoRow icon={Phone} label="Phone number" value={profile.phone ?? 'Not provided'} />
              <InfoRow icon={Building2} label="Campus" value={`${profile.campus.name} (${profile.campus.location})`} />
              <InfoRow icon={GraduationCap} label="Course" value={`${profile.course.title} · ${profile.course.level}`} />
              <InfoRow
                icon={CalendarCheck2}
                label="Study progress"
                value={`Year ${profile.yearOfStudy} · Term ${profile.currentTerm} · admitted ${fmtDate(profile.admittedAt)}`}
              />
              <InfoRow icon={BadgeCheck} label="KCSE grade" value={profile.kcseGrade ?? 'Not recorded'} />
              <InfoRow
                icon={UserRound}
                label="Guardian"
                value={
                  profile.guardianName
                    ? `${profile.guardianName}${profile.guardianPhone ? ` · ${profile.guardianPhone}` : ''}`
                    : 'Not recorded'
                }
              />
              <InfoRow icon={MapPin} label="Postal address" value={profile.address ?? 'Not provided'} />
            </dl>
          </CardContent>
        </Card>
      </motion.section>

      <ChangePasswordCard />
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: typeof Mail
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-400/15 text-gold-700 dark:text-gold-400">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
        <dd className={`mt-1 text-sm font-semibold ${mono ? 'font-mono' : ''}`}>{value}</dd>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Change password
// ---------------------------------------------------------------------------

function ChangePasswordCard() {
  const logout = useAuthStore((s) => s.logout)
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)

  const changePassword = useMutation({
    mutationFn: () =>
      post<{ updated: boolean }>('/api/auth/password', {
        currentPassword: current,
        newPassword: next,
      }),
    onSuccess: async () => {
      toast.success('Password changed', {
        description: 'Please sign in again with your new password.',
      })
      await logout()
      navigate('/login')
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'Could not change password — try again.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!current || !next || !confirm) {
      setError('Fill in all three password fields.')
      return
    }
    if (next.length < 6) {
      setError('New password must be at least 6 characters.')
      return
    }
    if (next !== confirm) {
      setError('New password and confirmation do not match.')
      return
    }
    setError(null)
    changePassword.mutate()
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.15 }}
      aria-labelledby="change-password"
    >
      <Card>
        <CardHeader className="pb-4">
          <CardTitle id="change-password" className="flex items-center gap-2 text-base">
            <KeyRound className="h-4 w-4 text-gold-600 dark:text-gold-400" aria-hidden="true" />
            Change password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="pw-current">
                  Current password
                  <span className="ml-0.5 font-bold text-gold-600 dark:text-gold-400" aria-hidden="true">
                    *
                  </span>
                </Label>
                <Input
                  id="pw-current"
                  type="password"
                  autoComplete="current-password"
                  value={current}
                  onChange={(e) => {
                    setCurrent(e.target.value)
                    setError(null)
                  }}
                  className="h-11"
                  aria-invalid={Boolean(error)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pw-new">
                  New password
                  <span className="ml-0.5 font-bold text-gold-600 dark:text-gold-400" aria-hidden="true">
                    *
                  </span>
                </Label>
                <Input
                  id="pw-new"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  value={next}
                  onChange={(e) => {
                    setNext(e.target.value)
                    setError(null)
                  }}
                  className="h-11"
                  aria-invalid={Boolean(error)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pw-confirm">
                  Confirm new password
                  <span className="ml-0.5 font-bold text-gold-600 dark:text-gold-400" aria-hidden="true">
                    *
                  </span>
                </Label>
                <Input
                  id="pw-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value)
                    setError(null)
                  }}
                  className="h-11"
                  aria-invalid={Boolean(error)}
                />
              </div>
            </div>
            {error && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {error}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-gold-600 dark:text-gold-400" aria-hidden="true" />
                Changing your password signs you out of other devices.
              </p>
              <Button
                type="submit"
                disabled={changePassword.isPending}
                className="focus-glow min-h-11"
              >
                {changePassword.isPending ? 'Updating…' : 'Update password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.section>
  )
}
