import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface AnimeCardProps {
  id: string;
  title: string;
  titleArabic?: string;
  coverImage?: string;
  rating?: number;
  type?: string;
  status?: string;
}

export const AnimeCard = ({
  id,
  title,
  titleArabic,
  coverImage,
  rating,
  type,
  status
}: AnimeCardProps) => {
  return (
    <Link to={`/anime/${id}`}>
      <Card className="anime-card-hover overflow-hidden glass-effect group">
        <div className="relative aspect-[2/3]">
          <img
            src={coverImage || "https://placehold.co/400x600/1a1a2e/8b5cf6?text=Anime"}
            alt={titleArabic || title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {status && (
            <Badge className="absolute top-2 right-2 bg-primary/90 backdrop-blur-sm">
              {status === 'ongoing' ? 'مستمر' : status === 'completed' ? 'مكتمل' : 'قريباً'}
            </Badge>
          )}
          
          {rating && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <span className="text-sm font-semibold">{rating}</span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="font-bold text-lg mb-1 line-clamp-1">{titleArabic || title}</h3>
          {type && (
            <Badge variant="outline" className="text-xs">
              {type === 'tv' ? 'مسلسل' : type === 'movie' ? 'فيلم' : type}
            </Badge>
          )}
        </div>
      </Card>
    </Link>
  );
};
