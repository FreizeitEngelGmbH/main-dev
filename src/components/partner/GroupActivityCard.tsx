import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar as CalendarIcon, Clock, Users, CheckCircle2, XCircle } from "lucide-react";
import { getGroupActivityImage } from "@/lib/group-activity-images";
import { formatActivityDateTime, formatDuration, formatPricePerPerson } from "@/lib/group-activity-format";

export interface PartnerGroupActivity {
  id: number;
  category: string;
  title: string;
  description?: string | null;
  city: string;
  location: string;
  activityDate: string;
  durationMinutes: number;
  maxParticipants: number;
  minParticipants?: number | null;
  currentParticipants: number;
  pricePerPerson: string | number;
  imageUrl?: string | null;
  organizerName?: string | null;
  organizerEmail?: string | null;
  status: string;
  decisionDeadline?: string | null;
  cancellationReason?: string | null;
}

export function GroupActivityStatusBadge({ status }: { status: string }) {
  if (status === "confirmed") {
    return (
      <Badge className="bg-emerald-600 text-white">
        <CheckCircle2 className="h-3 w-3 mr-1" /> Voll
      </Badge>
    );
  }
  if (status === "open") {
    return <Badge className="bg-purple-100 text-purple-700">Offen</Badge>;
  }
  if (status === "cancelled") {
    return (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" /> Abgesagt
      </Badge>
    );
  }
  return <Badge variant="secondary">{status}</Badge>;
}

export function GroupActivityCard({ activity }: { activity: PartnerGroupActivity }) {
  const image = getGroupActivityImage(activity);
  const fillPct = Math.min(
    100,
    Math.round((activity.currentParticipants / activity.maxParticipants) * 100)
  );

  return (
    <Link href={`/partner/group-activities/${activity.id}`}>
      <Card
        className="overflow-hidden hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1 border-0 shadow-md h-full"
        data-testid={`card-group-${activity.id}`}
      >
        <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} />
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2 gap-2">
            <div>
              <Badge variant="outline" className="text-[10px] capitalize mb-1">
                {activity.category}
              </Badge>
              <h3 className="font-bold text-base line-clamp-1">{activity.title}</h3>
            </div>
            <GroupActivityStatusBadge status={activity.status} />
          </div>

          {activity.description && (
            <p className="text-xs text-gray-600 line-clamp-2 mb-2">{activity.description}</p>
          )}

          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
              <span className="line-clamp-1">
                {activity.city}, {activity.location}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="h-3 w-3 text-gray-400 flex-shrink-0" />
              {formatActivityDateTime(activity.activityDate)}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-gray-400 flex-shrink-0" />
              {formatDuration(activity.durationMinutes)}
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-3 w-3 text-gray-400 flex-shrink-0" />
              {activity.currentParticipants} / {activity.maxParticipants} Teilnehmer
            </div>
          </div>

          <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-purple-600 rounded-full" style={{ width: `${fillPct}%` }} />
          </div>
          {typeof activity.minParticipants === "number" && (
            <p className="text-[11px] text-gray-500 mt-1">
              Mindestens {activity.minParticipants} Teilnehmer
            </p>
          )}

          <div className="mt-3 pt-3 border-t flex items-center justify-between gap-2">
            <div className="text-sm font-bold whitespace-nowrap">
              {formatPricePerPerson(activity.pricePerPerson)}
            </div>
            {activity.organizerName && (
              <div className="text-xs text-gray-500 truncate">
                Organisiert von {activity.organizerName}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
