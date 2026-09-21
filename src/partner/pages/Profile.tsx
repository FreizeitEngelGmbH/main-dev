import { useState } from "react";
import { Star, MapPin, Mail, Phone, Globe, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Avatar } from "../components/ui/avatar";
import { useDemoData } from "../context/demo-data-context";

export default function Profile() {
  const { profile, updateProfile } = useDemoData();
  const [form, setForm] = useState(profile);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    updateProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profil</h1>
        <p className="text-muted-foreground">Öffentliche Informationen zu deinem Partnerprofil</p>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-5">
          <Avatar name={profile.companyName} className="h-16 w-16 text-lg" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">{profile.companyName}</h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {profile.rating.toFixed(1)} ({profile.reviewCount} Bewertungen)
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {profile.city}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Partner seit{" "}
                {new Date(profile.memberSince).toLocaleDateString("de-DE", { month: "long", year: "numeric" })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Unternehmensdaten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Firmenname</label>
              <Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Ansprechpartner</label>
              <Input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Mail className="h-3.5 w-3.5" /> E-Mail
              </label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Phone className="h-3.5 w-3.5" /> Telefon
              </label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Adresse</label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Stadt / PLZ</label>
              <div className="flex gap-2">
                <Input value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} className="w-24" />
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Globe className="h-3.5 w-3.5" /> Website
              </label>
              <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Öffnungszeiten</label>
              <Input value={form.openingHours} onChange={(e) => setForm({ ...form, openingHours: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Beschreibung</label>
            <Textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button onClick={handleSave}>Änderungen speichern</Button>
            {saved && <span className="text-sm font-medium text-success">Gespeichert (nur lokal, Demo-Modus)</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
