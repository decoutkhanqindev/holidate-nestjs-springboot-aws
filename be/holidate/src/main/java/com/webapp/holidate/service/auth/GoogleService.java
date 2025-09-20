package com.webapp.holidate.service.auth;

import com.webapp.holidate.entity.user.Role;
import com.webapp.holidate.entity.user.User;
import com.webapp.holidate.entity.user.UserAuthInfo;
import com.webapp.holidate.repository.user.RoleRepository;
import com.webapp.holidate.repository.user.UserRepository;
import com.webapp.holidate.type.AuthProviderType;
import com.webapp.holidate.type.RoleType;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class GoogleService extends DefaultOAuth2UserService {
  UserRepository userRepository;
  RoleRepository roleRepository;

  @Override
  public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
    OAuth2User oAuth2User = super.loadUser(userRequest);
    return processGoogleUser(oAuth2User);
  }

  private OAuth2User processGoogleUser(OAuth2User oAuth2User) {
    Map<String, Object> attributes = oAuth2User.getAttributes();

    String email = (String) attributes.get("email");
    String name = (String) attributes.get("name");
    String googleId = (String) attributes.get("sub");
    String picture = (String) attributes.get("picture");

    User user = userRepository.findByEmail(email).orElse(null);
    if (user == null) {
      createUser(email, name, googleId, picture);
    } else {
      updateUser(user, name, googleId, picture);
    }

    return oAuth2User;
  }

  private void createUser(String email, String name, String googleId, String picture) {
    User user = User.builder()
      .email(email)
      .fullName(name)
      .avatarUrl(picture)
      .build();

    Role role = roleRepository.findByName(RoleType.USER.getValue());
    user.setRole(role);

    UserAuthInfo authInfo = UserAuthInfo.builder()
      .authProvider(AuthProviderType.GOOGLE.getValue())
      .authProviderId(googleId)
      .active(true)
      .user(user)
      .build();
    user.setAuthInfo(authInfo);

    userRepository.save(user);
  }

  private void updateUser(User user, String name, String googleId, String picture) {
    user.setFullName(name);
    user.setAvatarUrl(picture);

    UserAuthInfo authInfo = user.getAuthInfo();
    authInfo.setAuthProvider(AuthProviderType.GOOGLE.getValue());
    authInfo.setAuthProviderId(googleId);

    userRepository.save(user);
  }
}
