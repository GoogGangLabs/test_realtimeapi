import cv2
import numpy
import mediapipe as mp
import base64
import time

mp_holistic = mp.solutions.holistic
holistic = mp_holistic.Holistic(static_image_mode=True)

def get_landmark_list(landmarks):
  landmark_list = []

  if landmarks is None:
    return landmark_list

  for _, landmark in enumerate(landmarks.landmark):
    element = {}
    element['x'] = landmark.x
    element['y'] = landmark.y
    element['z'] = landmark.z

    if landmark.visibility > 0.0:
      element['visibility'] = landmark.visibility

    landmark_list.append(element)

  return landmark_list

def process(sequence, buffer):
  buffer = base64.b64decode(base64Data)
  np_data = numpy.frombuffer(buffer, numpy.uint8)
  image = cv2.imdecode(np_data, cv2.IMREAD_UNCHANGED)
  start = time.time()
  results = holistic.process(image[..., ::-1])
  print(f"{sequence} - {(time.time() - start) * 1000}ms")

  return {
    'left_hand': get_landmark_list(results.left_hand_landmarks),
    'right_hand': get_landmark_list(results.right_hand_landmarks),
    'pose': get_landmark_list(results.pose_landmarks),
    'face': get_landmark_list(results.face_landmarks)
  }
