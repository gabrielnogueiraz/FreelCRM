'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useProfile } from '@/hooks/use-profile'
import { useToast } from '@/hooks/use-toast'
import { User, Mail, Building, Phone, Globe, FileText, Upload, Save } from 'lucide-react'

export default function ProfilePage() {
  const { profile, loading, saving, updateProfile, uploadAvatar } = useProfile()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    full_name: '',
    company: '',
    phone: '',
    website: '',
    bio: ''
  })

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        company: profile.company || '',
        phone: profile.phone || '',
        website: profile.website || '',
        bio: profile.bio || ''
      })
    }
  }, [profile])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      await updateProfile(formData)
      toast({
        title: 'Sucesso!',
        description: 'Perfil atualizado com sucesso.',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar perfil.',
        variant: 'destructive',
      })
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      await uploadAvatar(file)
      toast({
        title: 'Sucesso!',
        description: 'Avatar atualizado com sucesso.',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao fazer upload do avatar.',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="space-y-8">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/4 mb-2" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
            <Card>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="h-24 w-24 bg-muted rounded-2xl" />
                    <div className="space-y-2">
                      <div className="h-6 bg-muted rounded w-48" />
                      <div className="h-4 bg-muted rounded w-32" />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-4 bg-muted rounded w-20" />
                        <div className="h-12 bg-muted rounded-xl" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Perfil</h1>
            <p className="text-muted-foreground text-lg mt-2">
              Gerencie suas informações pessoais
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize suas informações de perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="h-24 w-24 rounded-2xl object-cover border border-border"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-2xl bg-muted flex items-center justify-center border border-border">
                      <User className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={saving}
                  />
                  <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
                    <Upload className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {profile?.full_name || 'Nome não definido'}
                  </h3>
                  <p className="text-muted-foreground">{profile?.email}</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Nome Completo
                  </Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Seu nome completo"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    value={profile?.email || ''}
                    disabled
                    className="h-12 bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    O email não pode ser alterado
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-medium flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Empresa
                  </Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Sua empresa"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Telefone
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(XX) XXXXX-XXXX"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="website" className="text-sm font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://seu-site.com"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio" className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Conte um pouco sobre você..."
                    className="min-h-[120px]"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="h-12 px-8"
                >
                  {saving ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}