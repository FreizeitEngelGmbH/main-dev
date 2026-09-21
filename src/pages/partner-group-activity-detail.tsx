import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Calendar as CalendarIcon, Clock, Users, Euro, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { GroupActivityStatusBadge, type PartnerGroupActivity } from "@/components/partner/GroupActivityCard";
import { getGroupActivityImage } from "@/lib/group-activity-images";
import { formatActivityDateTime, formatDuration, formatPricePerPerson } from "@/lib/group-activity-format";

export default function PartnerGroupActivityDetail() {
  const { id } = useParams();

  const { data: activity, isLoading, error } = useQuery<PartnerGroupActivity>({
    queryKey: [`/api/partner/group-activities/${id}`],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50/30">
        <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold mb-2">Gruppe nicht gefunden</h2>
            <p className="text-muted-foreground mb-4">
              Diese Mach-mit-Gruppe existiert nicht (mehr).
            </p>
            <Link href="/partner/group-activities">
              <Button>Zurück zur Übersicht</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const image = getGroupActivityImage(activity);
  const fillPct = Math.min(
    100,
    Math.round((activity.currentParticipants / activity.maxParticipants) * 100)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50/30">
      <div className="max-w-3xl mx-auto p-4 md:p-6">
        <div className="mb-4">
          <Link href="/partner/group-activities">
            <Button variant="ghost" size="sm" className="gap-1" data-testid="link-back-group-activities">
              <ArrowLeft className="h-4 w-4" /> Alle Gruppen
            </Button>
          </Link>
        </div>

        <Card className="overflow-hidden border-0 shadow-md">
          <div className="h-48 md:h-64 bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} />
          <CardContent className="p-5 md:p-6">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <Badge variant="outline" className="text-[10px] capitalize mb-2">
                  {activity.category}
                </Badge>
                <h1 className="text-2xl font-black text-gray-900">{activity.title}</h1>
              </div>
              <GroupActivityStatusBadge status={activity.status} />
            </div>

            {activity.description && (
              <p className="text-sm text-gray-700 mb-4">{activity.description}</p>
            )}

            <Separator className="mb-4" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span>{activity.city}, {activity.location}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <CalendarIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span>{formatActivityDateTime(activity.activityDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span>{formatDuration(activity.durationMinutes)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Euro className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span>{formatPricePerPerson(activity.pricePerPerson)}</span>
              </div>
            </div>

            <Separator className="my-4" />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-gray-400" />
                  {activity.currentParticipants} / {activity.maxParticipants} Teilnehmer
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full" style={{ width: `${fillPct}%` }} />
              </div>
              {typeof activity.minParticipants === "number" && (
                <p className="text-xs text-gray-500 mt-1">
                  Mindestens {activity.minParticipants} Teilnehmer
                </p>
              )}
            </div>

            {(activity.organizerName || activity.organizerEmail) && (
              <>
                <Separator className="my-4" />
                <div className="text-sm">
                  <p className="text-gray-500 text-xs mb-1">Organisiert von</p>
                  {activity.organizerName && (
                    <p className="font-medium text-gray-900">{activity.organizerName}</p>
                  )}
                  {activity.organizerEmail && (
                    <a
                      href={`mailto:${activity.organizerEmail}`}
                      className="text-purple-700 hover:underline inline-flex items-center gap-1 mt-0.5"
                    >
                      <Mail className="h-3.5 w-3.5" /> {activity.organizerEmail}
                    </a>
                  )}
                </div>
              </>
            )}

            {activity.cancellationReason && (
              <>
                <Separator className="my-4" />
                <div className="text-sm bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">
                  <strong>Stornierungsgrund:</strong> {activity.cancellationReason}
                </div>
              </>
            )}

            {activity.decisionDeadline && (
              <p className="text-xs text-gray-500 mt-3">
                Entscheidungsfrist: {formatActivityDateTime(activity.decisionDeadline)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
