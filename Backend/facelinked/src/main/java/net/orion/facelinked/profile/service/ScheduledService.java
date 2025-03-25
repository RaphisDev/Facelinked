package net.orion.facelinked.profile.service;

import java.time.temporal.WeekFields;
import lombok.AllArgsConstructor;
import net.orion.facelinked.profile.repository.FaceSmashRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.Locale;

@AllArgsConstructor
@Service
public class ScheduledService {

    private FaceSmashRepository faceSmashRepository;

    @Scheduled(cron = "0 0 15 ? * MON")
    public void deleteOldFaceSmashes() {
        int currentWeek = LocalDate.now().get(WeekFields.of(Locale.getDefault()).weekOfWeekBasedYear());
        faceSmashRepository.deleteAllByWeekLessThan(currentWeek);
    }
}