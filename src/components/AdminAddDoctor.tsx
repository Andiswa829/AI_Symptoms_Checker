import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ApiService } from "../utils/api";

export function AdminAddDoctor({ onAdded }: { onAdded?: () => void }) {
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<string>("");
  const [lng, setLng] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const payload = {
        name, specialization, phone, email, address,
        location: lat && lng ? { lat: Number(lat), lng: Number(lng) } : null,
        source: "manual"
      };
      await ApiService.post("/api/doctors", payload); // ensure backend route exists
      onAdded?.();
      setName(""); setSpecialization(""); setPhone(""); setEmail(""); setAddress(""); setLat(""); setLng("");
    } catch (e: any) {
      setErr(e?.message || "Failed to add doctor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="spec">Specialization</Label>
        <Input id="spec" value={specialization} onChange={e => setSpecialization(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Input id="address" value={address} onChange={e => setAddress(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="lat">Latitude</Label>
          <Input id="lat" value={lat} onChange={e => setLat(e.target.value)} placeholder="e.g. -33.86" />
        </div>
        <div>
          <Label htmlFor="lng">Longitude</Label>
          <Input id="lng" value={lng} onChange={e => setLng(e.target.value)} placeholder="e.g. 151.20" />
        </div>
      </div>

      {err && <div className="text-red-600">{err}</div>}

      <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Add doctor"}</Button>
    </form>
  );
}